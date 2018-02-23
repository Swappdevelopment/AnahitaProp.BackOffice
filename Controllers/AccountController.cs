using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using AnahitaProp.Data;
using Swapp.Data.Hashing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Swapp.Data;
using AnahitaProp.Data.Models;

namespace AnahitaProp.BackOffice
{
    public class AccountController : BaseController
    {
        public AccountController(
            IConfigurationRoot config,
            IHostingEnvironment env,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, env, dbOptns, injHolder)
        {
        }


        [HttpPost]
        [ResponseCache(NoStore = true)]
        public async Task<IActionResult> SignIn([FromBody]LoginViewModel vm)
        {
            object result = null;

            string refreshTokenValue = null;
            string accessTokenValue = null;
            bool invalidPassword = false;
            string fullName = null;

            ClaimsIdentity claimsIdentity = null;
            int refreshExpValueInSecs = 0;

            Exception ex1 = null, ex2 = null;

            try
            {
                if (vm == null) throw new NullReferenceException(nameof(vm));


                await Task.WhenAll(
                            Helper.GetFunc(async () =>
                            {
                                try
                                {
                                    result = await _dbi.SignIn(vm.User, vm.Password, TokenClientType.WebApp);
                                }
                                catch (Exception ex)
                                {
                                    ex1 = ex;
                                }
                            })(),
                            Helper.GetFunc(() =>
                            {
                                try
                                {
                                    refreshExpValueInSecs = _dbi.GetSysParDetailValue("TokenParams", "RefreshTokenLifeSpan")?.IntVal ?? 0;

                                    if (refreshExpValueInSecs <= 0) throw new ExceptionID(MessageIdentifier.TOKEN_SYS_PARS_NOT_FOUND);
                                }
                                catch (Exception ex)
                                {
                                    ex2 = ex;
                                }

                                return Task.CompletedTask;
                            })());

                if (ex1 != null) throw ex1;
                if (ex2 != null) throw ex2;


                refreshTokenValue = result.GetPropVal<string>("r");
                accessTokenValue = result.GetPropVal<string>("a");
                invalidPassword = result.GetPropVal<bool>("i");
                fullName = result.GetPropVal<string>("fn");

                claimsIdentity = new ClaimsIdentity(BaseController.APP_ID);
                claimsIdentity.AddClaims(new Claim[]
                {
                    new Claim(REFRESH_TOKEN_KEY, refreshTokenValue),
                    new Claim(ACCESS_TOKEN_KEY, accessTokenValue),
                    new Claim(REMEMBER_USER, vm.Remember.ToString()),
                    new Claim(PASSWORD_FORMAT_INVALID, invalidPassword.ToString()),
                    new Claim(USER_FULL_NAME, fullName),
                });

                if (vm.Remember)
                {
                    claimsIdentity.AddClaim(
                                        new Claim(REFRESH_TOKEN_EXP_DATE_KEY, Helper.JSonSerializeObject(DateTimeOffset.UtcNow.AddSeconds(refreshExpValueInSecs))));

                    await HttpContext.Authentication.SignInAsync(
                                                        BaseController.APP_ID,
                                                        new ClaimsPrincipal(claimsIdentity),
                                                        new AuthenticationProperties
                                                        {
                                                            IsPersistent = true,
                                                            ExpiresUtc = DateTimeOffset.UtcNow.AddSeconds(refreshExpValueInSecs)
                                                        });
                }
                else
                {
                    await HttpContext.Authentication.SignInAsync(BaseController.APP_ID, new ClaimsPrincipal(claimsIdentity));
                }

                return Json(new
                {
                    Ok = true,
                    FullName = fullName,
                    Email = (_dbi?.LoginConnectionToken?.Email == _dbi?.LoginConnectionToken?.Uid ? "" : _dbi?.LoginConnectionToken?.Email),
                    Gender = _dbi?.LoginConnectionToken?.Gender
                });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                vm = null;
                result = null;
                refreshTokenValue = null;
                accessTokenValue = null;
                invalidPassword = false;
                fullName = null;
            }
        }


        [HttpPost]
        [Access(allowInvalidPassword: true)]
        [ResponseCache(NoStore = true)]
        public async Task<IActionResult> SignOut([FromBody]LoginViewModel vm)
        {
            try
            {
                if (vm == null || !vm.SignOut) throw new NullReferenceException(nameof(vm));


                await this.TrySignOut();

                return Json(new { Ok = true });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpPost]
        [ResponseCache(NoStore = true)]
        public async Task<IActionResult> TrySignOut([FromBody]LoginViewModel vm)
        {
            try
            {
                if (vm == null || !vm.SignOut) throw new NullReferenceException(nameof(vm));


                if (AccessRequirementHandler.HasAccess(this, _dbi))
                {
                    await this.TrySignOut();
                }

                return Json(new { Ok = true });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        private async Task TrySignOut()
        {
            RefreshToken refreshToken = null;

            try
            {
                refreshToken = _dbi.GetRefreshToken(tokenValue: this.GetRefreshTokenValue(), clientType: TokenClientType.WebApp, includeAccessTokens: true);


                if (refreshToken != null)
                {
                    _dbi.ManageIdentityModels(
                            refreshToken.AccessTokens.Select(at => at.SetRecordState(RecordState.Deleted))
                                .ConcatSingle(refreshToken.SetRecordState(RecordState.Deleted)).ToArray());
                }

                if (!string.IsNullOrEmpty(this.GetAccessTokenValue()))
                {
                    await HttpContext.Authentication.SignOutAsync(BaseController.APP_ID);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        [HttpPost]
        public IActionResult IsEmailValidationTokenConfirmed([FromBody]dynamic param = null)
        {
            bool result = false;

            try
            {
                string tokenValue = param.tokenValue;

                if (!string.IsNullOrEmpty(tokenValue))
                {
                    result = _dbi.IsEmailValidationTokenConfirmed(tokenValue);
                }

                return Json(new { Ok = result });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }


        [HttpPost]
        [Access(allowInvalidPassword: true)]
        public async Task<IActionResult> ChangePassword([FromBody]dynamic param = null)
        {
            string[] result = null;

            try
            {
                string oldPassword = param.oldPassword;
                string newPassword = param.newPassword;

                result = await this.ChangeUserPassword(null, oldPassword, newPassword);

                return Json(new { Ok = (result == null), result = result });
            }
            catch (ExceptionID ex)
            {
                switch (ex.ErrorID)
                {
                    case MessageIdentifier.SIGNIN_FAILED:
                        return UnauthorizedAccess(LanguageManager.GetMessage("msg_SgnInFld", this.GetSelectedLanguage()));

                    default:
                        return InternalServerError(ex);
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                result = null;
            }
        }

        [HttpPost]
        public async Task<IActionResult> ResetPassword([FromBody]dynamic param = null)
        {
            string[] result = null;

            try
            {
                string resetToken = param.resetToken;
                string newPassword = param.newPassword;

                result = await this.ChangeUserPassword(resetToken, null, newPassword);

                return Json(new { Ok = (result == null), result = result });
            }
            catch (ExceptionID ex)
            {
                switch (ex.ErrorID)
                {
                    case MessageIdentifier.SIGNIN_FAILED:
                        return UnauthorizedAccess(LanguageManager.GetMessage("msg_SgnInFld", this.GetSelectedLanguage()));

                    default:
                        return InternalServerError(ex);
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                result = null;
            }
        }

        private async Task<string[]> ChangeUserPassword(string resetToken, string oldPassword, string newPassword)
        {
            string[] result = null;

            PasswordPolicy passpol = null;
            string accessTokenValue = null;

            bool isPasswordValid = true;

            ClaimsIdentity claimsIdentity = null;

            try
            {
                resetToken = resetToken ?? "";
                oldPassword = oldPassword ?? "";
                newPassword = newPassword ?? "";

                passpol = _dbi.GetPasswordPolicy();

                if (passpol != null)
                {
                    string lang = this.GetSelectedLanguage();

                    var verifResult = passpol.IsPasswordFormatValid(newPassword);

                    if (!verifResult.IsValid())
                    {
                        isPasswordValid = false;

                        result = passpol
                                    .SetAlphaErrorMsg(LanguageManager.GetMessage("errMsg_Pswrd_Alpha", lang))
                                    .SetMinLenErrorMsg(LanguageManager.GetMessage("errMsg_Pswrd_MinLen", lang))
                                    .SetNumericErrorMsg(LanguageManager.GetMessage("errMsg_Pswrd_Numeric", lang))
                                    .SetSpacesErrorMsg(LanguageManager.GetMessage("errMsg_Pswrd_Spaces", lang))
                                    .SetSpecialErrorMsg(LanguageManager.GetMessage("errMsg_Pswrd_Special", lang))
                                    .SetUppercaseErrorMsg(LanguageManager.GetMessage("errMsg_Pswrd_Uppercase", lang))
                                    .GetErrorMessages(verifResult);
                    }
                }

                if (isPasswordValid)
                {
                    accessTokenValue = _dbi.ChangeAccountPassword(oldPassword, newPassword, resetToken);

                    if (string.IsNullOrEmpty(resetToken))
                    {
                        claimsIdentity = new ClaimsIdentity(BaseController.APP_ID);
                        claimsIdentity.AddClaims(this.User.Claims.Where(l => l.Type != ACCESS_TOKEN_KEY && l.Type != PASSWORD_FORMAT_INVALID));

                        claimsIdentity.AddClaim(new Claim(ACCESS_TOKEN_KEY, accessTokenValue));
                        claimsIdentity.AddClaim(new Claim(PASSWORD_FORMAT_INVALID, false.ToString()));

                        if (GetRememberUser(this.User))
                        {
                            await this.HttpContext.Authentication.SignInAsync(
                                                                    BaseController.APP_ID,
                                                                    new ClaimsPrincipal(claimsIdentity),
                                                                    new AuthenticationProperties
                                                                    {
                                                                        IsPersistent = true,
                                                                        ExpiresUtc = GetClaimExpDate(this.User)
                                                                    });
                        }
                        else
                        {
                            await this.HttpContext.Authentication.SignInAsync(BaseController.APP_ID, new ClaimsPrincipal(claimsIdentity));
                        }
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                result = null;
                passpol = null;
                accessTokenValue = null;
                claimsIdentity = null;
            }
        }


        [HttpPost]
        public async Task<IActionResult> RequestForgotPasswordToken([FromBody]dynamic param = null)
        {
            string urlToken = null, tokenValue = null, accountIdentifier = null, lang = null, email = null, appTitle = null;

            try
            {
                accountIdentifier = param.accountIdentifier;


                tokenValue = _dbi.RequestForgotPasswordToken(accountIdentifier, out email);

                if (string.IsNullOrEmpty(urlToken)) throw new ExceptionID(MessageIdentifier.TOKEN_NOT_FOUND);

                urlToken = Url.Action("resetpassword", "XxX", null, this.Request.Scheme).Replace("/XxX/", "/");
                urlToken += (urlToken.EndsWith("/") ? "" : "/") + tokenValue;


                lang = this.GetSelectedLanguage();
                appTitle = LanguageManager.GetLabel("AppTitle", lang);


                using (var mailService = this.GetMailService())
                {
                    await mailService.SendEmailAsync(
                                        LanguageManager.GetLabel("lbl_BoRstPsswrd", lang),
                                        LanguageManager.GetMessage("msg_VEmailMsg", lang).Replace("{1}", appTitle).Replace("{2}", urlToken),
                                        isMessageHtml: false,
                                        fromName: appTitle,
                                        toEmail: email);
                }

                return Json(new { Ok = true });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
            }
        }


        [HttpPost]
        public async Task<IActionResult> VerifyAccountToken([FromBody]dynamic param = null)
        {
            string tokenValue = null;
            AccountToken accountToken = null;

            object result = null;

            try
            {
                tokenValue = param.tokenValue;

                AccountTokenType type = (AccountTokenType)((short)param.accountType);

                accountToken = await GetAccountToken(tokenValue, type);


                switch (type)
                {
                    case AccountTokenType.EmailChange:

                        accountToken.Account.RegisterForRecordStateChange();
                        accountToken.Account.Email = accountToken.AddData;
                        accountToken.Account.EmailConfirmed = true;
                        accountToken.Account.UnregisterForRecordStateChange();

                        accountToken.RecordState = RecordState.Deleted;


                        _dbi.ManageIdentityModels(accountToken.Account, accountToken);
                        break;

                    case AccountTokenType.SignUp:

                        result = accountToken.Account.ToModel();
                        break;
                }

                return Json(new { Ok = true, result = result });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                tokenValue = null;
                accountToken = null;
                result = null;
            }
        }
        private async Task<AccountToken> GetAccountToken(string tokenValue, AccountTokenType accountTokenType)
        {
            AccountToken accountToken = null;
            Account account = null;
            SysParDetailValue sysParValue = null;

            Exception ex1 = null, ex2 = null;

            try
            {
                await Task.WhenAll(
                    Helper.GetFunc(() =>
                    {
                        try
                        {
                            accountToken = _dbi.GetAccountToken(tokenValue, type: accountTokenType);
                        }
                        catch (Exception ex)
                        {
                            ex1 = ex;
                        }

                        return Task.CompletedTask;
                    })(),
                    Helper.GetFunc(() =>
                    {
                        string detailCode = null;

                        try
                        {
                            switch (accountTokenType)
                            {
                                case AccountTokenType.EmailChange:
                                case AccountTokenType.SignUp:
                                    detailCode = "SignUpTokenLifeSpan";
                                    break;

                                case AccountTokenType.ResetPassword:
                                    detailCode = "ResetPasswordLifeSpan";
                                    break;
                            }

                            if (string.IsNullOrEmpty(detailCode))
                                throw new ExceptionID(MessageIdentifier.TOKEN_SYS_PARS_NOT_FOUND);


                            sysParValue = _dbi.GetSysParDetailValue(masterCode: "TokenParams", detailCode: detailCode);
                        }
                        catch (Exception ex)
                        {
                            ex2 = ex;
                        }

                        return Task.CompletedTask;
                    })());

                if (ex1 != null) throw ex1;
                if (ex2 != null) throw ex2;


                if (sysParValue == null)
                    throw new ExceptionID(MessageIdentifier.TOKEN_SYS_PARS_NOT_FOUND);


                if (accountToken == null
                    || accountToken.Account_Id == null
                    || accountToken.Account_Id <= 0)
                    throw new ExceptionID(MessageIdentifier.TOKEN_NOT_FOUND);


                if (accountToken.CreationTimeUtc.AddSeconds(sysParValue.IntVal.Value) < DateTimeOffset.UtcNow)
                    throw new ExceptionID(MessageIdentifier.ACCOUNT_CONNECTION_TOKEN_EXPIRED);


                account = _dbi.GetAccount(accountToken.Account_Id.Value, null, null, null, includeSignUpToken: (accountTokenType == AccountTokenType.SignUp));

                accountToken.Account = account ?? throw new ExceptionID(MessageIdentifier.TOKEN_NOT_FOUND);


                return accountToken;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                accountToken = null;
                account = null;
                sysParValue = null;
                ex1 = null;
                ex2 = null;
            }
        }


        [HttpGet]
        [Access]
        public IActionResult GetActiveProfile()
        {
            try
            {
                return Json(GetActiveProfileViewModel());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
        private object GetActiveProfileViewModel()
        {
            Account activeAccount = null;

            object result = null;

            try
            {
                activeAccount = _dbi.GetActiveAccount();

                if (activeAccount != null)
                {
                    result = activeAccount.ToModel();
                }

                return result;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                activeAccount = null;
                result = null;
            }
        }


        [HttpPost]
        [Access]
        public async Task<IActionResult> SaveActiveProfile([FromBody]AccountProfileViewModel vm = null)
        {
            Account activeAccount = null;
            string fullName = null;

            AccountToken toSend = null;

            List<IdentityModel> toSave = null;

            Exception ex1 = null, ex2 = null;

            ClaimsIdentity claimsIdentity = null;

            try
            {
                if (vm == null) throw new NullReferenceException();


                if (!string.IsNullOrEmpty(vm.Email)
                    && !Helper.IsEmailValid(vm.Email)) throw new ExceptionID(MessageIdentifier.INVALID_EMAIL);


                activeAccount = _dbi.GetActiveAccount();

                if (activeAccount == null
                    || activeAccount.UID != vm.UID) throw new NullReferenceException();


                toSave = new List<IdentityModel>();

                if (!string.IsNullOrEmpty(vm.Email)
                    && activeAccount.GetEmailValue()?.ToLower() != vm.Email.ToLower())
                {
                    string emailValue = activeAccount.GetEmailValue();

                    if (Helper.IsEmailValid(emailValue))
                    {
                        toSave.AddRange(from t in activeAccount.AccountTokens
                                        where t.Type == AccountTokenType.EmailChange
                                        select t.SetRecordState(RecordState.Deleted));
                    }

                    toSend = new AccountToken()
                    {
                        RecordState = RecordState.Added,
                        Value = _dbi.GenerateTokenValue(),
                        Type = AccountTokenType.EmailChange,
                        EmailSentStatus = EmailSatus.NotSent,
                        AddData = vm.Email,
                        Account_Id = activeAccount.ID
                    };

                    activeAccount.RegisterForRecordStateChange();
                    activeAccount.Email = activeAccount.UID;
                    activeAccount.EmailConfirmed = false;
                    activeAccount.UnregisterForRecordStateChange();
                }


                activeAccount.RegisterForRecordStateChange();

                activeAccount.AccountName = vm.AccountName;
                activeAccount.FName = vm.FName;
                activeAccount.LName = vm.LName;

                activeAccount.UnregisterForRecordStateChange();



                if (activeAccount.RecordState != RecordState.None)
                {
                    toSave.Add(activeAccount);
                }

                if (toSend == null)
                {
                    if (toSave.Count > 0)
                    {
                        _dbi.ManageIdentityModels(toSave.ToArray());
                    }
                }
                else
                {
                    await Task.WhenAll(
                            Helper.GetFunc(() =>
                            {
                                try
                                {
                                    if (toSave.Count > 0)
                                    {
                                        _dbi.ManageIdentityModels(toSave.ToArray());
                                    }
                                }
                                catch (Exception ex)
                                {
                                    ex1 = ex;
                                }

                                return Task.CompletedTask;
                            })(),
                            Helper.GetFunc(() =>
                            {
                                try
                                {
                                    toSend = _dbi.ManageModel(toSend);
                                }
                                catch (Exception ex)
                                {
                                    ex2 = ex;
                                }

                                return Task.CompletedTask;
                            })());

                    if (ex1 != null) throw ex1;
                    if (ex2 != null) throw ex2;


                    string lang = this.GetSelectedLanguage();

                    using (var mailService = this.GetMailService())
                    {
                        await Task.WhenAll(
                            Helper.GetFunc(() =>
                            {
                                try
                                {
                                    toSend.RegisterForRecordStateChange();
                                    toSend.EmailSentStatus = EmailSatus.Sending;
                                    toSend.UnregisterForRecordStateChange();

                                    if (toSend.RecordState != RecordState.None)
                                    {
                                        toSend = _dbi.ManageModel(toSend);
                                    }
                                }
                                catch (Exception ex)
                                {
                                    ex1 = ex;
                                }

                                return Task.CompletedTask;
                            })(),
                            Helper.GetFunc(async () =>
                            {
                                string link = null;

                                try
                                {
                                    link = Url.Action("xxXxx", "confirmemail", null, this.Request.Scheme);
                                    link += (link.EndsWith("/") ? "" : "/") + toSend.Value;

                                    link = link.Replace("/xxXxx/", "/");

                                    await mailService.SendEmailAsync(
                                                $"{LanguageManager.GetLabel("AppTitle", lang)} {LanguageManager.GetLabel("lbl_CnfrmEmailAddr", lang)}",
                                                LanguageManager.GetOther("email_ChngEmail", lang)
                                                    .Replace("{1}", LanguageManager.GetLabel("AppTitle", lang))
                                                    .Replace("{2}", link),
                                                toEmail: toSend.AddData,
                                                fromName: LanguageManager.GetLabel("AppTitle", lang),
                                                replyToEmail: "noreply@thinkbox.com",
                                                replyToName: "NO REPLY");
                                }
                                catch (Exception ex)
                                {
                                    ex2 = new ExceptionID(MessageIdentifier.INVALID_EMAIL, ex, false);
                                }
                                finally
                                {
                                    link = null;
                                }
                            })());

                        if (ex1 != null) throw ex1;
                        if (ex2 != null)
                        {
                            _dbi.ManageModel(toSend.SetRecordState(RecordState.Deleted));

                            throw ex2;
                        }

                        toSend.RegisterForRecordStateChange();
                        toSend.EmailSentStatus = EmailSatus.Sent;
                        toSend.UnregisterForRecordStateChange();

                        if (toSend.RecordState != RecordState.None)
                        {
                            toSend = _dbi.ManageModel(toSend);
                        }
                    }
                }


                fullName = DbInteractor.GetAccountFullName(activeAccount);

                claimsIdentity = new ClaimsIdentity(BaseController.APP_ID);
                claimsIdentity.AddClaims(this.User.Claims.Where(l => l.Type != USER_FULL_NAME));

                claimsIdentity.AddClaim(new Claim(USER_FULL_NAME, fullName));

                if (GetRememberUser(this.User))
                {
                    await this.HttpContext.Authentication.SignInAsync(
                                                            BaseController.APP_ID,
                                                            new ClaimsPrincipal(claimsIdentity),
                                                            new AuthenticationProperties
                                                            {
                                                                IsPersistent = true,
                                                                ExpiresUtc = GetClaimExpDate(this.User)
                                                            });
                }
                else
                {
                    await this.HttpContext.Authentication.SignInAsync(BaseController.APP_ID, new ClaimsPrincipal(claimsIdentity));
                }

                return Json(new { Ok = true, FullName = fullName, profile = this.GetActiveProfileViewModel() });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                activeAccount = null;
                claimsIdentity = null;

                toSave?.Clear();
                toSave = null;
            }
        }

        [HttpPost]
        public async Task<IActionResult> ForgotPasswordGenToken([FromBody]dynamic vm = null)
        {
            string email = null, tempStr = null;

            Account account = null;
            AccountToken accountToken = null;

            Exception ex1 = null, ex2 = null;

            try
            {
                tempStr = vm?.accountIdentifier;

                if (string.IsNullOrEmpty(tempStr)) throw new ExceptionID(MessageIdentifier.INVALID_EMAIL);


                if (Helper.IsEmailValid(tempStr))
                {
                    email = tempStr;
                    tempStr = null;
                }


                account = _dbi.GetAccount(0, null, email, tempStr);

                if (account == null
                    || !Helper.IsEmailValid(account.Email)) throw new ExceptionID(MessageIdentifier.USER_NOT_FOUND);


                await Task.WhenAll(
                        Helper.GetFunc(() =>
                        {
                            AccountToken[] toDeleteTokens = null;

                            try
                            {
                                toDeleteTokens = _dbi.GetAccountTokens(accountID: account.ID, type: AccountTokenType.ResetPassword)
                                                     .Select(l => l.SetRecordState<AccountToken>(RecordState.Deleted))
                                                     .ToArray();

                                if (toDeleteTokens.Length > 0)
                                {
                                    _dbi.ManageIdentityModels(toDeleteTokens);
                                }
                            }
                            catch (Exception ex)
                            {
                                ex1 = ex;
                            }
                            finally
                            {
                                toDeleteTokens = null;
                            }

                            return Task.CompletedTask;
                        })(),
                        Helper.GetFunc(() =>
                        {
                            try
                            {
                                tempStr = _dbi.GenerateTokenValue();

                                accountToken = _dbi.ManageModel(
                                                        new AccountToken()
                                                        {
                                                            RecordState = RecordState.Added,
                                                            Account_Id = account.ID,
                                                            Type = AccountTokenType.ResetPassword,
                                                            EmailSentStatus = EmailSatus.NotSent,
                                                            Value = tempStr
                                                        });
                            }
                            catch (Exception ex)
                            {
                                ex2 = ex;
                            }

                            return Task.CompletedTask;
                        })());

                if (ex1 != null) throw ex1;
                if (ex2 != null) throw ex2;



                string link = null, lang = null;

                try
                {
                    lang = this.GetSelectedLanguage();

                    link = Url.Action("xxXxx", "resetpassword", null, this.Request.Scheme);
                    link += (link.EndsWith("/") ? "" : "/") + accountToken.Value;

                    link = link.Replace("/xxXxx/", "/");

                    using (var mailService = this.GetMailService())
                    {
                        await mailService.SendEmailAsync(
                                    $"{LanguageManager.GetLabel("AppTitle", lang)} {LanguageManager.GetLabel("lbl_RstPsswrd", lang)}",
                                    LanguageManager.GetOther("email_RstPsswrd", lang)
                                        .Replace("{1}", LanguageManager.GetLabel("AppTitle", lang))
                                        .Replace("{2}", link),
                                    toEmail: account.Email,
                                    fromName: LanguageManager.GetLabel("AppTitle", lang),
                                    replyToEmail: "noreply@thinkbox.com",
                                    replyToName: "NO REPLY");
                    }
                }
                catch (Exception ex)
                {
                    _dbi.ManageModel(accountToken.SetRecordState(RecordState.Deleted));

                    throw ex;
                }
                finally
                {
                    link = null;
                    lang = null;
                }


                return Json(new { Ok = true, token = "" });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                email = null;
                tempStr = null;
                account = null;
                ex1 = null;
                ex2 = null;
            }
        }

        [HttpPost]
        public async Task<IActionResult> ProcessRegistration([FromBody]dynamic param = null)
        {
            string tokenValue = null, accountName = null, fName = null, lName = null, password = null;
            AccountToken accountToken = null;
            Exception ex1 = null, ex2 = null;

            string[] errMsgs = null;
            PasswordPolicy passPol = null;

            try
            {
                tokenValue = param.tokenValue;
                accountName = param.accountName;
                fName = param.fName;
                lName = param.lName;
                password = param.password;


                await Task.WhenAll(
                    Helper.GetFunc(() =>
                    {
                        string lang = null;

                        try
                        {
                            passPol = _dbi.GetPasswordPolicy();

                            if (passPol != null)
                            {
                                lang = this.GetSelectedLanguage();

                                var verifResult = passPol.IsPasswordFormatValid(password);

                                if (!verifResult.IsValid())
                                {
                                    errMsgs = passPol
                                                .SetAlphaErrorMsg(LanguageManager.GetMessage("errMsg_Pswrd_Alpha", lang))
                                                .SetMinLenErrorMsg(LanguageManager.GetMessage("errMsg_Pswrd_MinLen", lang))
                                                .SetNumericErrorMsg(LanguageManager.GetMessage("errMsg_Pswrd_Numeric", lang))
                                                .SetSpacesErrorMsg(LanguageManager.GetMessage("errMsg_Pswrd_Spaces", lang))
                                                .SetSpecialErrorMsg(LanguageManager.GetMessage("errMsg_Pswrd_Special", lang))
                                                .SetUppercaseErrorMsg(LanguageManager.GetMessage("errMsg_Pswrd_Uppercase", lang))
                                                .GetErrorMessages(verifResult);
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            ex1 = ex;
                        }
                        finally
                        {
                            lang = null;
                        }

                        return Task.CompletedTask;
                    })(),
                    Helper.GetFunc(async () =>
                    {
                        try
                        {
                            accountToken = await GetAccountToken(tokenValue, AccountTokenType.SignUp);
                        }
                        catch (Exception ex)
                        {
                            ex2 = ex;
                        }
                    })());

                if (ex1 != null) throw ex1;
                if (ex2 != null) throw ex2;


                if (errMsgs == null || errMsgs.Length == 0)
                {
                    accountToken.Account.RegisterForRecordStateChange();
                    accountToken.Account.Email = accountToken.AddData;
                    accountToken.Account.EmailConfirmed = true;
                    accountToken.Account.AccountName = string.IsNullOrEmpty(accountName) ? accountToken.Account.UID : accountName;
                    accountToken.Account.FName = fName;
                    accountToken.Account.LName = lName;
                    accountToken.Account.PasswordHash = PasswordHash.CreateHash(password);
                    accountToken.Account.UnregisterForRecordStateChange();

                    if (accountToken.Account.RecordState == RecordState.Updated)
                    {
                        accountToken.RecordState = RecordState.Deleted;

                        _dbi.ManageIdentityModels(accountToken.Account, accountToken);
                    }
                }


                return Json(new { Ok = true, errMsgs = errMsgs });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                tokenValue = null;
            }
        }
    }
}

using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using AnahitaProp.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Swapp.Data;
using AnahitaProp.Data.Models;

namespace AnahitaProp.BackOffice
{
    public class AccountManagementController : BaseController
    {
        public AccountManagementController(
            IConfigurationRoot config,
            IHostingEnvironment env,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, env, dbOptns, injHolder)
        {
        }

        [HttpGet]
        [Access]
        [MenuRequirement("user-management")]
        public IActionResult Get(string nameFilter = null, short? statusFilter = null, int limit = 0, int offset = 0)
        {
            object[] result = null;
            Account activeAccount = null;

            try
            {
                activeAccount = _dbi.GetActiveAccount();

                result = _dbi.GetAccounts(
                                nameFilter: nameFilter,
                                statusFilter: statusFilter,
                                includeRoles: true,
                                includeSignUpToken: true,
                                withDevs: activeAccount != null && activeAccount.IsDev ? null : new bool?(false),
                                limit: limit,
                                offset: offset)?.Select(l => l.Simplify()).ToArray();

                return Json(result);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                result = null;
                activeAccount = null;
            }
        }

        [HttpPost]
        [Access]
        [MenuRequirement("user-management>crud>create")]
        public IActionResult CreateAccount([FromBody]dynamic param)
        {
            Account account = null;

            List<IdentityModel> toSave = null;

            bool deleted = false;

            try
            {
                account = Helper.JSonCamelDeserializeObject<Account>(param);

                if (account == null) throw new NullReferenceException();


                toSave = new List<IdentityModel>();

                switch (account.RecordState)
                {
                    case RecordState.Deleted:

                        if (account.ID > 0)
                        {
                            account = _dbi.GetAccount(account.ID, null, null, null);

                            if (account != null)
                            {
                                account.RegisterForRecordStateChange();
                                account.Status = ModelStatus.Inactive;
                                account.UnregisterForRecordStateChange();

                                toSave.Add(account);

                                deleted = true;
                            }
                        }
                        break;

                    case RecordState.Updated:

                        if (account.ID > 0)
                        {
                            account.Email = string.IsNullOrEmpty(account.Email) ? account.UID : account.Email;
                            account.AccountName = string.IsNullOrEmpty(account.AccountName) ? account.UID : account.AccountName;

                            toSave.Add(account);
                        }

                        break;

                    case RecordState.Added:

                        account.UID = Helper.GenerateSequentialGuid().ToString();
                        account.Email = string.IsNullOrEmpty(account.Email) ? account.UID : account.Email;
                        account.AccountName = string.IsNullOrEmpty(account.AccountName) ? account.UID : account.AccountName;
                        account.PasswordHash = string.IsNullOrEmpty(account.PasswordHash) ? account.UID : account.PasswordHash;

                        if (Helper.IsEmailValid(account.Email) && !_dbi.CanUseAccountEmail(account.Email))
                            throw new ExceptionID(MessageIdentifier.USER_EMAIL_ALREADY_USED);


                        toSave.Add(account);

                        if (account.AccountRoles != null)
                        {
                            foreach (var acRole in account.AccountRoles.Where(ar => ar.Role_Id > 0))
                            {
                                acRole.RecordState = RecordState.Added;
                                acRole.AddCommand("Account_Id", $"SELECT ID FROM Accounts WHERE UID = '{account.UID}'");

                                toSave.Add(acRole);
                            }
                        }

                        if (Helper.IsEmailValid(account.Email))
                        {
                            toSave.Add(new AccountToken()
                            {
                                RecordState = RecordState.Added,
                                Value = _dbi.GenerateTokenValue(),
                                Type = AccountTokenType.SignUp,
                                EmailSentStatus = EmailSatus.NotSent,
                                AddData = account.Email
                            }.AddCommand("Account_Id", $"SELECT ID FROM Accounts WHERE UID = '{account.UID}'"));

                            account.Email = account.UID;
                        }

                        break;
                }

                if (toSave.Count > 0)
                {
                    _dbi.ManageIdentityModels(toSave.ToArray());

                    account = deleted ?
                                null :
                                _dbi.GetAccounts(
                                        uid: account.UID,
                                        statusFilter: 1,
                                        includeRoles: true,
                                        includeSignUpToken: true).FirstOrDefault();
                }


                return Json(new { account = account?.Simplify() });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                account = null;

                toSave?.Clear();
                toSave = null;
            }
        }

        [HttpPost]
        [Access]
        [MenuRequirement("user-management>crud>update")]
        public IActionResult AddRoleToAccount([FromBody]dynamic param)
        {
            AccountRole accountRole = null;

            try
            {
                accountRole = Helper.JSonCamelDeserializeObject<AccountRole>(param);

                if (accountRole == null) throw new NullReferenceException();


                switch (accountRole.RecordState)
                {
                    case RecordState.Deleted:

                        if (accountRole.ID > 0)
                        {
                            _dbi.ManageIdentityModels(accountRole);
                            accountRole = null;
                        }
                        break;

                    case RecordState.Added:

                        if (accountRole.Role_Id > 0 && accountRole.Account_Id > 0)
                        {
                            accountRole = _dbi.ManageModel(accountRole);
                            accountRole.Role = _dbi.GetRole(accountRole.Role_Id);
                        }
                        break;
                }


                return Json(new { accountRole = accountRole?.Simplify(true) });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                accountRole = null;
            }
        }

        [HttpPost]
        [Access]
        [MenuRequirement("user-management>crud>create")]
        public async Task<IActionResult> SendSignupEmail([FromBody]dynamic param)
        {
            string link = null;

            AccountToken accountToken = null;

            Exception ex1 = null, ex2 = null;

            try
            {
                accountToken = Helper.JSonCamelDeserializeObject<AccountToken>(param);

                if (accountToken == null || accountToken.ID <= 0 || string.IsNullOrEmpty(accountToken.Value)) throw new NullReferenceException();


                await Task.WhenAll(
                    Helper.GetFunc(async () =>
                    {
                        string lang = null;

                        try
                        {
                            lang = LanguageManager.DEFAULT_LANGUAGE;

                            link = Url.Action("xxXxx", "completeregistration", null, this.Request.Scheme);
                            link += (link.EndsWith("/") ? "" : "/") + accountToken.Value;

                            link = link.Replace("/xxXxx/", "/");

                            using (var mailService = this.GetMailService())
                            {
                                await mailService.SendEmailAsync(
                                            $"{LanguageManager.GetLabel("AppTitle", lang)} {LanguageManager.GetLabel("lbl_CompleteReg", lang)}",
                                            LanguageManager.GetOther("email_SignUp", lang)
                                                .Replace("{1}", LanguageManager.GetLabel("AppTitle", lang))
                                                .Replace("{2}", link),
                                            toEmail: accountToken.AddData,
                                            fromName: LanguageManager.GetLabel("AppTitle", lang),
                                            replyToEmail: "noreply@thinkbox.com",
                                            replyToName: "NO REPLY");
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
                    })(),
                    Helper.GetFunc(() =>
                    {
                        try
                        {
                            accountToken.RegisterForRecordStateChange();
                            accountToken.EmailSentStatus = EmailSatus.Sending;
                            accountToken.UnregisterForRecordStateChange();

                            accountToken = _dbi.ManageModel(accountToken);
                        }
                        catch (Exception ex)
                        {
                            ex2 = ex;
                        }

                        return Task.CompletedTask;
                    })());


                if (ex1 != null || ex2 != null)
                {
                    accountToken.RegisterForRecordStateChange();
                    accountToken.EmailSentStatus = EmailSatus.SendFail;
                    accountToken.UnregisterForRecordStateChange();

                    accountToken = _dbi.ManageModel(accountToken);


                    if (ex1 != null) throw ex1;
                    if (ex2 != null) throw ex2;
                }

                accountToken.RegisterForRecordStateChange();
                accountToken.EmailSentStatus = EmailSatus.Sent;
                accountToken.UnregisterForRecordStateChange();

                accountToken = _dbi.ManageModel(accountToken);


                return Json(accountToken.Simplify());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                link = null;
            }
        }
    }
}

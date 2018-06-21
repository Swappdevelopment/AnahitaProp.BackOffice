using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using AnahitaProp.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using Swapp.Data;
using Microsoft.Extensions.Configuration;

namespace AnahitaProp.BackOffice
{
    public class AccessRequirementHandler : AuthorizationHandler<AccessRequirement>
    {
        protected IConfigurationRoot _config = null;
        private IHostingEnvironment _env = null;
        private DbContextOptionsWrapper _dbOptnsWrapper = null;
        private InjectorObjectHolder _injHolder = null;

        public AccessRequirementHandler(
            IHostingEnvironment env,
            IConfigurationRoot config,
            DbContextOptionsWrapper dbOptnsWrapper,
            InjectorObjectHolder injHolder)
        {
            _env = env;
            _config = config;
            _dbOptnsWrapper = dbOptnsWrapper;
            _injHolder = injHolder;

            if (_dbOptnsWrapper != null)
            {
                _dbOptnsWrapper.GetConnectionString = () => BaseController.GetConnectionString(_config);
            }
        }


        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, AccessRequirement requirement)
        {
            if (context?.User != null && requirement != null)
            {
                AuthorizationFilterContext authFilterContext = null;
                ClaimsIdentity claimsIdentity = null;

                string rTokenValue = null, userFullName = null, accessTokenValue = null;

                bool isInvalidPassword = false;

                Dictionary<string, string> menusReq = null;

                try
                {
                    authFilterContext = context.Resource as AuthorizationFilterContext;

                    if (authFilterContext?.HttpContext != null)
                    {
                        using (var dbi = new AppDbInteractor(
                                                new AppDbContext(_dbOptnsWrapper),
                                                () =>
                                                {
                                                    string aToken = context?.User?.FindFirst(BaseController.ACCESS_TOKEN_KEY)?.Value;

                                                    return aToken;
                                                }))
                        {
                            bool accessTokenGood = true;

                            try
                            {
                                dbi.VerifyConnectionToken();
                            }
                            catch (ExceptionID)
                            {
                                accessTokenGood = false;
                            }
                            catch (Exception ex)
                            {
                                throw ex;
                            }

                            isInvalidPassword = context.User.FindFirst(BaseController.PASSWORD_FORMAT_INVALID)?.Value?.ToLower() == "true";


                            if (!accessTokenGood)
                            {
                                rTokenValue = context.User.FindFirst(BaseController.REFRESH_TOKEN_KEY)?.Value;
                                userFullName = context.User.FindFirst(BaseController.USER_FULL_NAME)?.Value;
                                bool rememberUser = context.User.FindFirst(BaseController.REMEMBER_USER)?.Value?.ToLower() == "true";

                                accessTokenValue = dbi.RegenAccessTokenValue(rTokenValue, isInvalidPassword);

                                claimsIdentity = new ClaimsIdentity(BaseController.APP_ID);
                                claimsIdentity.AddClaims(context.User.Claims.Where(l => l.Type != BaseController.ACCESS_TOKEN_KEY));

                                claimsIdentity.AddClaim(new Claim(BaseController.ACCESS_TOKEN_KEY, accessTokenValue));

                                if (BaseController.GetRememberUser(context.User))
                                {
                                    await authFilterContext.HttpContext.Authentication.SignInAsync(
                                                                            BaseController.APP_ID,
                                                                            new ClaimsPrincipal(claimsIdentity),
                                                                            new AuthenticationProperties
                                                                            {
                                                                                IsPersistent = true,
                                                                                ExpiresUtc = BaseController.GetClaimExpDate(context.User)
                                                                            });
                                }
                                else
                                {
                                    await authFilterContext.HttpContext.Authentication.SignInAsync(BaseController.APP_ID, new ClaimsPrincipal(claimsIdentity));
                                }
                            }

                            if (isInvalidPassword && !requirement.AllowInvalidPasswordFormat)
                                throw new ExceptionAccess(HttpStatusCode.PartialContent);


                            menusReq = authFilterContext.Filters?.OfType<MenuRequirementAttribute>()?.FirstOrDefault()?.GetSlugAndPaths();

                            if (menusReq != null && menusReq.Count > 0)
                            {
                                bool hasMenuAccess = true;

                                await Task.WhenAll(
                                            menusReq.Select(mnu => Helper.GetFunc(() =>
                                            {
                                                if (hasMenuAccess)
                                                {
                                                    bool temp = dbi.AccountHasMenuAccess(mnu.Key, mnu.Value);

                                                    lock (menusReq)
                                                    {
                                                        hasMenuAccess = hasMenuAccess ? temp : false;
                                                    }
                                                }

                                                return Task.CompletedTask;
                                            })()));

                                if (!hasMenuAccess)
                                    throw new ExceptionAccess(HttpStatusCode.Forbidden);
                            }

                            _injHolder.AddObject("ConnToken", Helper.JSonCamelSerializeObject(dbi.ConnToken));
                        }
                    }

                    context.Succeed(requirement);
                }
                catch (ExceptionAccess ex)
                {
                    throw ex;
                }
                catch (ExceptionID ex)
                {
                    throw new ExceptionAccess(HttpStatusCode.Unauthorized, ex);
                }
                catch (Exception ex)
                {
                    throw new ExceptionAccess(HttpStatusCode.InternalServerError, ex);
                }
                finally
                {
                    authFilterContext = null;

                    menusReq?.Clear();
                    menusReq = null;
                }
            }
        }


        internal static bool HasAccess(Controller controller, AppDbInteractor dbi)
        {
            return HasAccess(controller?.User, dbi);
        }
        internal static bool HasAccess(ClaimsPrincipal claimsPrincipal, AppDbInteractor dbi)
        {
            if (claimsPrincipal != null && dbi != null)
            {
                Exception ex1 = null;

                bool accessTokenValid = false;

                try
                {
                    try
                    {
                        dbi.VerifyConnectionToken();

                        accessTokenValid = true;
                    }
                    catch (Exception ex)
                    {
                        ex1 = ex;
                    }

                    if (!accessTokenValid)
                    {
                        return (dbi.GetRefreshToken(tokenValue: claimsPrincipal.FindFirst(BaseController.REFRESH_TOKEN_KEY)?.Value) != null);
                    }

                    return true;
                }
                catch (Exception ex)
                {
                    ex1 = ex;
                }
                finally
                {
                    ex1 = null;
                }
            }

            return false;
        }
    }
}

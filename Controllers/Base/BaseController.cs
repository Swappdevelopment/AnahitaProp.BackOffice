﻿using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using MySql.Data.MySqlClient;
using AnahitaProp.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using Swapp.Data;

namespace AnahitaProp.BackOffice
{
    public class BaseController : Controller
    {
        internal const string APP_ID = "SWAPP_THINKBOX";

        internal const string TOKENS_KEY = "APP_TOKENS";
        internal const string REFRESH_TOKEN_KEY = "REFRESH_TOKEN";
        internal const string ACCESS_TOKEN_KEY = "ACCESS_TOKEN";
        internal const string REFRESH_TOKEN_EXP_DATE_KEY = "REFRESH_TOKEN_EXP_DATE";
        internal const string PASSWORD_FORMAT_INVALID = "PASSWORD_FORMAT_INVALID";
        internal const string REMEMBER_USER = "REMEMBER_USER";
        internal const string USER_FULL_NAME = "USER_FULL_NAME";
        internal const string USER_LANGUAGE = "USER_LANGUAGE";


        protected IConfigurationRoot _config = null;
        protected AppDbInteractor _dbi = null;
        protected InjectorObjectHolder _injHolder = null;


        public BaseController(
            IConfigurationRoot config,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
        {
            _config = config;

            _injHolder = injHolder;

            if (dbOptns != null)
            {
                dbOptns.GetConnectionString = this.GetConnectionString;
                _dbi = new AppDbInteractor(new AppDbContext(dbOptns), GetAccessTokenValue);
            }

            if (_injHolder != null && _dbi != null)
            {
                object temp = _injHolder.GetObject("ConnToken");

                temp = Helper.JSonCamelDeserializeObject<LoginConnectionToken>(temp);

                if (temp != null)
                {
                    _dbi.ConnToken = (LoginConnectionToken)temp;

                    temp = null;
                }
            }
        }


        public string GetSelectedLanguage()
        {
            string lang = null;
            string[] bLangs = null;

            try
            {
                lang = this.Request.Cookies[$"{APP_ID}:{USER_LANGUAGE}"];

                if (string.IsNullOrEmpty(lang))
                {
                    bLangs = GetBrowserLanguages();

                    lang = bLangs?[0];
                }

                lang = ValidateLanguageKey(lang);

                return lang ?? LanguageManager.DEFAULT_LANGUAGE;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                lang = null;
                bLangs = null;
            }
        }

        public string[] GetBrowserLanguages()
        {
            try
            {
                return Request?.Headers?["Accept-Language"].ToString()?.Split(',');
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private string ValidateLanguageKey(string key)
        {
            if (string.IsNullOrEmpty(key) || key.Length == 1) return null;


            return key.Split('_', '-').Select(l => l.Trim()).ToArray()[0].ToUpper();
        }


        public string GetRefreshTokenValue()
        {
            return GetRefreshTokenValue(this.User);
        }


        public string GetAccessTokenValue()
        {
            return GetAccessTokenValue(this.User);
        }

        internal static string GetAccessTokenValue(ClaimsPrincipal claimsPrincipal)
        {
            return claimsPrincipal?.FindFirst(ACCESS_TOKEN_KEY)?.Value;
        }

        internal static string GetRefreshTokenValue(ClaimsPrincipal claimsPrincipal)
        {
            return claimsPrincipal?.FindFirst(REFRESH_TOKEN_KEY)?.Value;
        }

        internal static bool GetIsInvalidPasswordFormat(ClaimsPrincipal claimsPrincipal)
        {
            return claimsPrincipal?.FindFirst(PASSWORD_FORMAT_INVALID)?.Value?.ToLower() == "true";
        }

        internal static bool GetRememberUser(ClaimsPrincipal claimsPrincipal)
        {
            return claimsPrincipal?.FindFirst(REMEMBER_USER)?.Value?.ToLower() == "true";
        }

        internal static string GetUserFullName(ClaimsPrincipal claimsPrincipal)
        {
            return claimsPrincipal?.FindFirst(USER_FULL_NAME)?.Value;
        }

        internal static DateTimeOffset? GetClaimExpDate(ClaimsPrincipal claimsPrincipal)
        {
            return Helper.JSonDeserializeObject<DateTimeOffset?>(claimsPrincipal?.FindFirst(REFRESH_TOKEN_EXP_DATE_KEY)?.Value);
        }


        public IActionResult FailedRequest(Exception ex)
        {
            bool inDev = this.IsDevelopment();

            if (inDev)
            {
                return FailedRequest(content: ex);
            }
            else if (ex is ExceptionID)
            {
                return FailedRequest(content: ((ExceptionID)ex).ErrorID);
            }
            else if (ex is MySqlException)
            {
                return FailedRequest(content: new KeyValuePair<int, string>(((MySqlException)ex).Number, "DB"));
            }

            return FailedRequest();
        }


        public IActionResult InternalServerError(Exception ex)
        {
            bool inDev = this.IsDevelopment();

            if (inDev)
            {
                return InternalServerError(content: ex);
            }
            else if (ex is ExceptionID)
            {
                return InternalServerError(content: ((ExceptionID)ex).ErrorID);
            }
            else if (ex is MySqlException)
            {
                return InternalServerError(content: new KeyValuePair<int, string>(((MySqlException)ex).Number, "DB"));
            }

            return InternalServerError();
        }
        public static IActionResult InternalServerError(object content = null)
        {
            return ActionRequest(HttpStatusCode.InternalServerError, content);
        }
        public static IActionResult FailedRequest(object content = null)
        {
            return ActionRequest(HttpStatusCode.BadRequest, content);
        }
        public static IActionResult UnauthorizedAccess(object content = null)
        {
            return ActionRequest(HttpStatusCode.Unauthorized, content);
        }
        public static IActionResult Forbiden(object content = null)
        {
            return ActionRequest(HttpStatusCode.Forbidden, content);
        }
        public static IActionResult PartialContent(object content = null)
        {
            return ActionRequest(HttpStatusCode.PartialContent, content);
        }
        public static IActionResult ActionRequest(HttpStatusCode statusCode, object content = null)
        {
            return ActionRequest((int)statusCode, content);
        }
        public static IActionResult ActionRequest(int statusCode, object content = null)
        {
            return new ObjectResult(ErrorObject(statusCode, content)) { StatusCode = statusCode };
        }
        internal static object ErrorObject(int statusCode, object content)
        {
            int? exID = null;

            if (content is MessageIdentifier)
            {
                exID = (int)content;
                content = null;
            }
            else if (content is KeyValuePair<int, string>)
            {
                exID = ((KeyValuePair<int, string>)content).Key;
                content = ((KeyValuePair<int, string>)content).Value;
            }
            else if (content is ExceptionID)
            {
                exID = (int)((ExceptionID)content).ErrorID;
                content = ((ExceptionID)content).MergeMsgInnerExMsgs();
            }
            else if (content is MySqlException)
            {
                exID = ((MySqlException)content).Number;
                content = ((MySqlException)content).MergeMsgInnerExMsgs();
            }
            else if (content is Exception)
            {
                content = new { message = ((Exception)content).MergeMsgInnerExMsgs(), stackTrace = ((Exception)content).StackTrace };
            }

            return new { Type = "error", StatusCode = statusCode, Content = content, ExceptionID = exID };
        }


        protected IMailService GetMailService()
        {
            if (this.IsDevelopment() && (_config != null && !bool.Parse(_config["App:ForceProdMail"]))) return new DevMailService();


            return new MailService(_config);
        }


        protected bool IsInternetExplorer()
        {
            return IsInternetExplorer(Request?.Headers["User-Agent"]);
        }

        public static bool IsInternetExplorer(string userAgent)
        {
            if (!string.IsNullOrEmpty(userAgent)
                && (userAgent.Contains("MSIE") || userAgent.Contains("Trident")))
            {
                return true;
            }
            else
            {
                return false;
            }
        }


        protected IActionResult Gocheck(Func<IActionResult> func)
        {
            try
            {
                if (_config != null)
                {
                    switch (_config["App:State"])
                    {
                        case "maintenance":
                            return Redirect($"/maintenance");
                    }
                }

                this.ViewData["Environment"] = this.Environment;

                if (func == null) throw new NullReferenceException();


                return func();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }



        public SessionEnvironment Environment
        {
            get
            {
                return GetEnvironment(_config);
            }
        }

        public bool IsDevelopment()
        {
            return this.Environment == SessionEnvironment.Development;
        }
        public bool IsStaging()
        {
            return this.Environment == SessionEnvironment.Development;
        }
        public bool IsProduction()
        {
            return this.Environment == SessionEnvironment.Development;
        }


        public static SessionEnvironment GetEnvironment(IConfigurationRoot config)
        {
            if (config != null)
            {
                switch (config["App:Publish:Env"]?.ToLower())
                {
                    case "staging":
                        return SessionEnvironment.Staging;

                    case "development":
                        return SessionEnvironment.Development;
                }
            }

            return SessionEnvironment.Production;
        }


        public string GetConnectionString()
        {
            return GetConnectionString(_config);
        }

        internal static string GetConnectionString(IConfigurationRoot config)
        {
            if (config == null) return "";


            string connStr = null;

            switch (GetEnvironment(config))
            {
                case SessionEnvironment.Development:
                    connStr = DevSecrets.GetSecretValue("connectionStrings:anahitaProp:local:mysql");
                    //connStr = Configuration["ConnectionStrings:production:value"];
                    break;

                case SessionEnvironment.Staging:
                    connStr = config["ConnectionStrings:staging:value"];
                    break;

                default:
                    connStr = config["ConnectionStrings:production:value"];
                    break;
            }

            return connStr;
        }
    }
}

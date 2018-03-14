using AnahitaProp.BackOffice.Localization.Resources;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using Swapp.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace AnahitaProp.BackOffice
{
    public class LanguageController : BaseController
    {
        public LanguageController(IConfigurationRoot config)
            : base(config, null, null)
        {
        }


        [HttpGet]
        [ResponseCache(Duration = 31536000)] // 1 Year
        public IActionResult GetLangsContent()
        {
            IActionResult result = null;

            try
            {
                result = Json(
                            new
                            {
                                Active = this.GetSelectedLanguage()?.ToLower(),
                                EN = new
                                {
                                    Name = "English",
                                    Labels = TypeToDico(typeof(Resource_Labels)),
                                    Msgs = TypeToDico(typeof(Resource_Msgs)),
                                    Others = TypeToDico(typeof(Resource_Others))
                                },
                                FR = new
                                {
                                    Name = "Français",
                                    Labels = TypeToDico(typeof(Resource_Labels_FR)),
                                    Msgs = TypeToDico(typeof(Resource_Msgs_FR)),
                                    Others = TypeToDico(typeof(Resource_Others_FR))
                                }
                            });

                return result;
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

        private Dictionary<string, string> TypeToDico(Type type)
        {
            if (type == null) return new Dictionary<string, string>();


            Dictionary<string, string> result = null;

            try
            {
                result = type.GetProperties()
                              .Where(pi => pi != null && pi.Name != null && pi.PropertyType == typeof(string))
                              .ToDictionary(pi => pi.Name, pi => pi.GetValue(null) as string);

                return result;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                result = null;
            }
        }


        [HttpPost]
        public IActionResult ChangeLanguage([FromBody]JObject jparam)
        {
            string langCode = null;

            try
            {
                langCode = jparam?.JGetPropVal<string>("langCode");

                if (!string.IsNullOrEmpty(langCode))
                {
                    this.Response.Cookies.Append($"{APP_ID}:{USER_LANGUAGE}", langCode, new Microsoft.AspNetCore.Http.CookieOptions() { Expires = DateTimeOffset.UtcNow.AddDays(120) });
                }

                return Json(new { ok = true });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}

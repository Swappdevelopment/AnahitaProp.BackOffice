using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.Extensions.Configuration;
using Swapp.Data;
using System;
using System.Collections.Generic;

namespace ThinkBox.Web
{
    public static class Extensions
    {
        public static string GetCacheVersion(this IConfigurationRoot obj)
        {
            try
            {
                return obj["App:CacheVersion"];
            }
            catch
            {
                return "";
            }
        }
        public static bool IsPublishEnvStaging(this IConfigurationRoot obj)
        {
            try
            {
                return (obj["App:Publish:Env"].ToLower() == "staging");
            }
            catch
            {
                return false;
            }
        }
        public static bool IsPublishEnvProduction(this IConfigurationRoot obj)
        {
            try
            {
                return (obj["Publish:Env"].ToLower() == "production");
            }
            catch
            {
                return false;
            }
        }


        public static T GetViewData<T>(this RazorPage page, string key)
        {
            try
            {
                return Helper.ConvertTo<T>(GetViewData(page, key));
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public static object GetViewData(RazorPage page, string key)
        {
            object tryGetValue = null;

            IDictionary<string, object> viewData = null;

            try
            {
                viewData = page.GetPropVal("ViewData") as IDictionary<string, object>;

                if (viewData != null && viewData.TryGetValue(key, out tryGetValue))
                {
                    return tryGetValue;
                }

                return null;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                tryGetValue = null;
                viewData = null;
            }
        }
    }
}

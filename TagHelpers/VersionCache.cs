using Microsoft.Extensions.Configuration;
using System;
using System.IO;

namespace ThinkBox.Web
{
    public static class VersionCache
    {
        internal const string CURRENT_ATTRIBUTE_NAME = "swp-cache-version";

        internal static string GetPathContent(string src, IConfigurationRoot configRoot)
        {
            if (string.IsNullOrEmpty(src)) return src;


            string rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

            if (!Directory.Exists(rootPath)) return src;


            string path = src;
            string filePath;

            FileInfo fi = null;

            try
            {
                if (path.StartsWith("~"))
                {
                    path = path.Substring(1, path.Length - 1);
                }

                path = path.StartsWith("/") ? path : $"/{path}";

                filePath = path.Replace("/", "\\");

                filePath = (rootPath.EndsWith("\\") ? rootPath.Substring(0, rootPath.Length - 1) : rootPath) + filePath;


                fi = new FileInfo(filePath);

                if (fi.Exists)
                {
                    src = src + "?v=" + fi.LastWriteTime.ToFileTimeUtc().ToString() + (configRoot == null ? "" : $"A{configRoot.GetCacheVersion()}");
                }

                return src;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                rootPath = null;
                path = null;
                filePath = null;
                fi = null;
            }
        }
    }
}

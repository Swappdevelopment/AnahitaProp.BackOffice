using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace AnahitaProp.BackOffice
{
    public static class LanguageManager
    {
        public const string DEFAULT_LANGUAGE = "EN";

        private static Dictionary<string, Dictionary<string, string>> _langs = new Dictionary<string, Dictionary<string, string>>();

        private static string GetString(string key, string library, string lang)
        {
            if (string.IsNullOrEmpty(key) || string.IsNullOrEmpty(library)) return key;


            library = library.ToLower();

            lang = (string.IsNullOrEmpty(lang) ? DEFAULT_LANGUAGE : lang).ToLower();

            Dictionary<string, string> dico = null;

            var asm = typeof(LanguageManager).GetTypeInfo().Assembly;

            Type resType = null;

            string result = null;

            try
            {
                if (!_langs.TryGetValue($"{library}[{lang}]", out dico))
                {
                    bool isDefault = lang == DEFAULT_LANGUAGE.ToLower();

                    resType = asm.GetTypes()
                                .FirstOrDefault(l =>
                                        l.Namespace != null
                                        && l.Namespace.ToLower().EndsWith("resources")
                                        && l.Name != null
                                        && l.Name.ToLower().EndsWith($"resource_{library}{(isDefault ? "" : $"_{lang}")}"));

                    if (resType == null) return key;


                    dico = TypeToDico(resType);

                    if (dico == null) return key;


                    _langs.Add($"{library}[{lang}]", dico);
                }

                if (dico == null) return key;


                dico.TryGetValue(key, out result);


                return string.IsNullOrEmpty(result) ? key : result;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                library = null;
                lang = null;
                dico = null;
                asm = null;
                resType = null;
                result = null;
            }
        }


        public static string GetLabel(string key, string lang)
        {
            try
            {
                return GetString(key, "labels", lang);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public static string GetMessage(string key, string lang)
        {
            try
            {
                return GetString(key, "msgs", lang);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public static string GetOther(string key, string lang)
        {
            try
            {
                return GetString(key, "others", lang);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public static Dictionary<string, string> TypeToDico(Type type)
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
    }
}

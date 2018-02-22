using Microsoft.AspNetCore.Mvc.Filters;
using System.Collections.Generic;
using System.Linq;

namespace ThinkBox.Web
{
    public class MenuRequirementAttribute : ActionFilterAttribute
    {
        public MenuRequirementAttribute(params string[] menus)
        {
            this.Menus = menus ?? new string[0];
        }

        public string[] Menus { get; private set; }


        public Dictionary<string, string> GetSlugAndPaths()
        {
            if (this.Menus == null) return null;


            return this.Menus.ToDictionary(mnu => GetMenuSlug(mnu), mnu => GetMenuPath(mnu));
        }


        public static string GetMenuPath(string menu)
        {
            if (string.IsNullOrEmpty(menu)) return null;


            var arr = menu.Split('>').Select(s => s?.Trim()).Where(s => !string.IsNullOrEmpty(s)).ToArray();

            string result = ">";

            for (int i = 0; i < arr.Length - 1; i++)
            {
                result += $"{arr[i]}>";
            }

            return result;
        }


        public static string GetMenuSlug(string menu)
        {
            if (string.IsNullOrEmpty(menu)) return null;


            var arr = menu.Split('>').Select(s => s?.Trim()).Where(s => !string.IsNullOrEmpty(s)).ToArray();

            return arr.Length > 0 ? arr[arr.Length - 1] : null;
        }
    }
}

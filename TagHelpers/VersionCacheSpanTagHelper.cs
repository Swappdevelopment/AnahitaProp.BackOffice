using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.Extensions.Configuration;

namespace AnahitaProp.BackOffice
{
    [HtmlTargetElement("span", Attributes = VersionCache.CURRENT_ATTRIBUTE_NAME)]
    public class VersionCacheSpanTagHelper : TagHelper
    {
        private IConfigurationRoot _configRoot;

        public VersionCacheSpanTagHelper(IConfigurationRoot configRoot)
            : base()
        {
            _configRoot = configRoot;
        }

        [HtmlAttributeName(VersionCache.CURRENT_ATTRIBUTE_NAME)]
        public bool? Active { get; set; }


        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            base.Process(context, output);

            if (this.Active == true &&
                output.Attributes.ContainsName("href"))
            {
                string src = output.Attributes["href"].Value == null ? "" : output.Attributes["href"].Value.ToString();

                string newSrc = VersionCache.GetPathContent(src, _configRoot);

                output.Attributes.SetAttribute("href", newSrc);
            }
        }
    }
}

using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Mvc.TagHelpers;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using System.Text.Encodings.Web;

namespace ThinkBox.Web
{
    [HtmlTargetElement("link", Attributes = VersionCache.CURRENT_ATTRIBUTE_NAME)]
    public class VersionCacheLinkTagHelper : LinkTagHelper
    {
        private IConfigurationRoot _configRoot;

        public VersionCacheLinkTagHelper(
            IHostingEnvironment hostingEnvironment,
            IMemoryCache cache,
            HtmlEncoder htmlEncoder,
            JavaScriptEncoder javaScriptEncoder,
            IUrlHelperFactory urlHelperFactory,
            IConfigurationRoot configRoot)
            : base(hostingEnvironment, cache, htmlEncoder, javaScriptEncoder, urlHelperFactory)
        {
            _configRoot = configRoot;
        }

        [HtmlAttributeName(VersionCache.CURRENT_ATTRIBUTE_NAME)]
        public bool? Active
        {
            get
            {
                return base.AppendVersion;
            }
            set
            {
                base.AppendVersion = value;
            }
        }


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

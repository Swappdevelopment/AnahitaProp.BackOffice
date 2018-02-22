using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using AnahitaProp.Data;
using AnahitaProp.Data.Models;

namespace AnahitaProp.BackOffice
{
    public class HomeController : BaseController
    {
        public HomeController(
            IConfigurationRoot config,
            IHostingEnvironment env,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, env, dbOptns, injHolder)
        {
        }

        public IActionResult Index()
        {
            Assembly assembly = null;
            FileInfo fileInfo = null;
            SysParDetail[] versions = null;

            try
            {
                assembly = Assembly.Load(new AssemblyName("ThinkBox.Localization"));

                fileInfo = new FileInfo(assembly.Location);

                this.ViewData["LangVersion"] = fileInfo.LastWriteTimeUtc.Ticks.ToString();

                this.ViewData["CacheVersion"] = _config["App:CacheVersion"];
                this.ViewData["DbVersion"] = _config["App:DbVersion"];
                this.ViewData["CountriesVersion"] = _config["App:CountriesVersion"];

                versions = _dbi.GetSysParDetails(SysParMaster.LOOKUP_VERSIONS_CODE);

                this.ViewData["LookupVersions"] =
                                versions == null ?
                                new KeyValuePair<string, int>[0] :
                                versions.Select(l => new KeyValuePair<string, int>(l.Code, l.GetValue()?.IntVal ?? 0)).ToArray();
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }


            return View();
        }
    }
}

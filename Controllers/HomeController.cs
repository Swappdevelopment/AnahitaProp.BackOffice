using AnahitaProp.Data;
using AnahitaProp.Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;

namespace AnahitaProp.BackOffice
{
    public class HomeController : BaseController
    {
        public HomeController(
            IConfigurationRoot config,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, dbOptns, injHolder)
        {
        }

        public IActionResult Index()
        {
            return this.Gocheck(() =>
            {
                Assembly assembly = null;
                FileInfo fileInfo = null;
                SysParDetail[] versions = null;

                try
                {
                    assembly = Assembly.Load(new AssemblyName("AnahitaProp.BackOffice.Localization"));

                    fileInfo = new FileInfo(assembly.Location);

                    this.ViewData["IsInternetExplorer"] = this.IsInternetExplorer();
                    this.ViewData["LangVersion"] = fileInfo.LastWriteTimeUtc.Ticks.ToString();

                    this.ViewData["CacheVersion"] = _config["App:CacheVersion"];
                    this.ViewData["DbVersion"] = _config["App:DbVersion"];
                    this.ViewData["CountriesVersion"] = _config["App:CountriesVersion"];
                    this.ViewData["AssetsDomain"] = _config["App:domain:assets"];

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
                finally
                {
                    assembly = null;
                    fileInfo = null;
                    versions = null;
                }


                return View();
            });
        }
    }
}

using AnahitaProp.Data;
using AnahitaProp.Data.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;

namespace AnahitaProp.BackOffice
{
    public class LookupController : BaseController
    {
        public LookupController(
            IConfigurationRoot config,
            IHostingEnvironment env,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, env, dbOptns, injHolder)
        {
        }


        [HttpGet]
        [Access]
        [ResponseCache(Duration = 5184000)] // 60 Days
        public IActionResult GetCountries()
        {
            Country[] countries = null;
            Country defCountry = null;

            string defCountryCode = null;

            object[] result = null;

            try
            {
                countries = _dbi.GetCountries();

                defCountryCode = _dbi.GetSysParDetailValue("DefaultValues", "Country")?.StringVal;

                result = countries.Select(l =>
                {
                    if (l.Code == defCountryCode)
                    {
                        defCountry = l;
                    }

                    return l.Simplify();
                }).ToArray();


                return Json(new { countries = result, defCountry = defCountry?.Simplify() });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                countries = null;
                defCountry = null;
                defCountryCode = null;
                result = null;
            }
        }


        [HttpGet]
        [Access]
        public IActionResult GetRoles()
        {
            Role[] roles = null;

            try
            {
                roles = _dbi.GetRoles();


                return Json(roles.Select(l => l.Simplify()).ToArray());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                roles = null;
            }
        }
    }
}

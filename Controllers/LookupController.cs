using AnahitaProp.Data;
using AnahitaProp.Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Swapp.Data;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace AnahitaProp.BackOffice
{
    public class LookupController : BaseController
    {
        public LookupController(
            IConfigurationRoot config,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, dbOptns, injHolder)
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



        [HttpGet]
        [Access]
        [ResponseCache(Duration = 2592000)] // 30 Days
        public async Task<IActionResult> GetCurrencies()
        {
            Currency[] result = null;

            string defaultCurCode = null;

            try
            {
                await Task.WhenAll(
                    Helper.GetFunc(() =>
                    {
                        result = _dbi.GetCurrencies();

                        return Task.CompletedTask;
                    })(),
                    Helper.GetFunc(() =>
                    {
                        defaultCurCode = _dbi.GetSysParDetailValue("WebCurs", "Default")?.StringVal;

                        return Task.CompletedTask;
                    })());


                return Json(result == null ? new object[0] : result.OrderBy(l => l.Code).Select(l => l.Simplify(defaultCurCode)).ToArray());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                defaultCurCode = null;
                result = null;
            }
        }



        [HttpGet]
        [Access]
        [ResponseCache(Duration = 2592000)] // 30 Days
        public IActionResult GetProductFamilyTypes()
        {
            ProductFamilyType[] types = null;

            try
            {
                types = _dbi.GetProductFamilyTypes(withNames: true);


                return Json(types == null ? new object[0] : types.Select(l => l.Simplify()).ToArray());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                types = null;
            }
        }



        [HttpGet]
        [Access]
        public IActionResult GetProductFamilies()
        {
            ProductFamily[] families = null;

            try
            {
                families = _dbi.GetProductFamilys(withNames: true);


                return Json(families == null ? new object[0] : families.Select(l => l.Simplify()).ToArray());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                families = null;
            }
        }



        [HttpGet]
        [Access]
        public IActionResult GetFlagViews()
        {
            Flag[] flags = null;

            try
            {
                flags = _dbi.GetFlags(colValueRef: Flag.VIEW_REF, includeFieldTypes: true);


                return Json(flags == null ? new object[0] : flags.Select(l => l.Simplify()).ToArray());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                flags = null;
            }
        }
    }
}

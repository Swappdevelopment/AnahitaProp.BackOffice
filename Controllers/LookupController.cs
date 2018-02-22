using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Swapp.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ThinkBox.Data;
using ThinkBox.Data.Models;

namespace ThinkBox.Web
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
        public IActionResult GetBusinessTypes()
        {
            BusinessType[] businessTypes = null;

            try
            {
                businessTypes = _dbi.GetBusinessTypes();

                return Json(businessTypes
                                .Where(l => !string.IsNullOrEmpty(l.Name?.Trim()))
                                .Select(l => l.Simplify()).ToArray());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                businessTypes = null;
            }
        }


        [HttpPost]
        [Access]
        public async Task<IActionResult> SaveBusinessType([FromBody]dynamic param)
        {
            BusinessType businessType = null, dbBusinessType = null;
            SysParMaster lookupVersions = null;
            SysParDetail businessTypeVersion = null;
            SysParDetailValue businessTypeVersionValue = null;

            Exception ex1 = null, ex2 = null;

            List<IdentityModel> toSave = null;

            try
            {
                if (param == null) throw new NullReferenceException();


                businessType = Helper.JSonCamelDeserializeObject<BusinessType>(param);

                if (businessType == null) throw new NullReferenceException();

                int? version = null;

                if (businessType.RecordState != RecordState.None)
                {
                    toSave = new List<IdentityModel>();

                    await Task.WhenAll(
                                Helper.GetFunc(() =>
                                {
                                    try
                                    {
                                        lookupVersions = _dbi.GetSysParMaster(SysParMaster.LOOKUP_VERSIONS_CODE, onlyDetailCode: SysParDetail.LOOKUP_VERSION_BUSINESSTYPE);
                                        if (lookupVersions != null && lookupVersions.SysParDetails != null)
                                        {
                                            businessTypeVersion = lookupVersions.SysParDetails.FirstOrDefault();
                                        }
                                    }
                                    catch (Exception ex)
                                    {
                                        ex1 = ex;
                                    }

                                    return Task.CompletedTask;
                                })(),
                                Helper.GetFunc(() =>
                                {
                                    try
                                    {
                                        dbBusinessType = _dbi.GetBusinessType(businessType.Name);
                                    }
                                    catch (Exception ex)
                                    {
                                        ex2 = ex;
                                    }

                                    return Task.CompletedTask;
                                })());

                    if (ex1 != null) throw ex1;
                    if (ex2 != null) throw ex2;


                    switch (businessType.RecordState)
                    {
                        case RecordState.Added:

                            if (_dbi.GetBusinessType(businessType.Name) != null)
                                throw new ExceptionID(MessageIdentifier.RECORD_ALREADY_EXISTS);


                            businessType.UID = Helper.GenerateSequentialGuid().ToString();
                            break;

                        case RecordState.Updated:

                            break;
                    }

                    toSave.Add(businessType);


                    version = 1;

                    if (lookupVersions == null)
                    {
                        lookupVersions = new SysParMaster()
                        {
                            RecordState = RecordState.Added,
                            Code = SysParMaster.LOOKUP_VERSIONS_CODE
                        };
                        toSave.Add(lookupVersions);
                    }

                    if (businessTypeVersion == null)
                    {
                        businessTypeVersion = new SysParDetail()
                        {
                            RecordState = RecordState.Added,
                            Code = SysParDetail.LOOKUP_VERSION_BUSINESSTYPE
                        };

                        if (lookupVersions.ID > 0)
                        {
                            businessTypeVersion.SysParMaster_Id = lookupVersions.ID;
                        }
                        else
                        {
                            businessTypeVersion.AddCommand("SysParMaster_Id", $"SELECT ID FROM SysParMasters WHERE Code = '{lookupVersions.Code}' ");
                        }

                        toSave.Add(businessTypeVersion);

                        foreach (var data in BaseDesc.StringToDescs<SysParDetailData>(Helper.JSonSerializeObject(new SysParDetailValue() { IntVal = version }), RecordState.Added))
                        {
                            data.AddCommand("SysParDetail_Id", "SELECT sd.ID FROM SysParDetails as sd " +
                                                               "JOIN SysParMasters as sm ON sd.SysParMaster_Id = sm.ID " +
                                                               $"WHERE sm.Code = '{lookupVersions.Code}' AND sd.Code = '{businessTypeVersion.Code}' ");
                            toSave.Add(data);
                        }
                    }
                    else
                    {
                        businessTypeVersionValue = businessTypeVersion.GetValue();

                        if (businessTypeVersionValue != null && businessTypeVersionValue.IntVal != null)
                        {
                            version = businessTypeVersionValue.IntVal.Value + 1;
                        }

                        if (businessTypeVersion.Datas != null)
                        {
                            foreach (var data in businessTypeVersion.Datas)
                            {
                                data.SetRecordState(RecordState.Deleted);
                                toSave.Add(data);
                            }
                        }

                        foreach (var data in BaseDesc.StringToDescs<SysParDetailData>(Helper.JSonSerializeObject(new SysParDetailValue() { IntVal = version }), RecordState.Added))
                        {
                            data.SysParDetail_Id = businessTypeVersion.ID;
                            toSave.Add(data);
                        }
                    }

                    _dbi.ManageIdentityModels(toSave.ToArray());

                    if (businessType.RecordState == RecordState.Deleted)
                    {
                        businessType = null;
                    }
                    {
                        businessType = _dbi.GetBusinessType(businessType.Name);
                    }
                }
                else
                {
                    businessType = null;
                }

                return Json(new { result = businessType?.Simplify(), version = version });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                toSave?.Clear();
                toSave = null;

                businessType = null;
                dbBusinessType = null;
                lookupVersions = null;
                businessTypeVersion = null;
                businessTypeVersionValue = null;

                ex1 = null;
                ex2 = null;
            }
        }


        [HttpGet]
        [Access]
        [ResponseCache(Duration = 5184000)] // 60 Days
        public IActionResult GetOccupations()
        {
            Occupation[] occupations = null;

            try
            {
                occupations = _dbi.GetOccupations();

                return Json(occupations
                                .Where(l => !string.IsNullOrEmpty(l.Name?.Trim()))
                                .Select(l => l.Simplify()).ToArray());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                occupations = null;
            }
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

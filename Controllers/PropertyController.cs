using AnahitaProp.Data;
using AnahitaProp.Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using Swapp.Data;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AnahitaProp.BackOffice
{
    public class PropertyController : BaseController
    {
        public PropertyController(
            IConfigurationRoot config,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, dbOptns, injHolder)
        {
        }

        [HttpGet]
        [Access]
        [MenuRequirement("properties>crud")]
        public IActionResult GetPropertiesDetails()
        {
            Property[] result = null;

            try
            {
                result = _dbi.GetPropertysDetails();

                return Json(result == null ? new object[0] : result.Select(l => l.Simplify()).ToArray());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                result = null;
            }
        }

        [HttpPost]
        [Access]
        [MenuRequirement("properties>crud")]
        public IActionResult Save([FromBody]JObject param = null)
        {
            Property property = null;

            var toSave = new List<IdentityModel>();

            try
            {
                property = Helper.JSonCamelDeserializeObject<Property>(param);

                if (property != null)
                {
                    switch (property.RecordState)
                    {
                        case RecordState.Added:

                            if (property.Neighbourhood_Id > 0)
                            {
                                property.UID = Helper.GenerateSequentialGuid().ToString();
                                toSave.Add(property);
                            }
                            break;

                        case RecordState.Updated:

                            if (property.ID > 0 && property.Neighbourhood_Id > 0)
                            {
                                toSave.Add(property);
                            }
                            break;

                        case RecordState.Deleted:

                            if (property.ID > 0)
                            {
                                toSave.Add(property);

                                property = null;
                            }
                            break;
                    }

                    if (toSave.Count > 0)
                    {
                        _dbi.ManageIdentityModels(toSave.ToArray());

                        if (property != null && property.RecordState != RecordState.Deleted)
                        {
                            property = _dbi.GetPropertysDetails(code: property.Code).FirstOrDefault();
                        }
                    }
                    else
                    {
                        property = null;
                    }
                }

                return Json(property == null ? new { ok = false } : property.Simplify());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                property = null;
            }
        }
    }
}

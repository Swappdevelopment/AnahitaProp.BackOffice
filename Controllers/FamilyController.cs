using AnahitaProp.Data;
using AnahitaProp.Data.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using Swapp.Data;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AnahitaProp.BackOffice
{
    public class FamilyController : BaseController
    {
        public FamilyController(
            IConfigurationRoot config,
            IHostingEnvironment env,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, env, dbOptns, injHolder)
        {
        }

        [HttpPost]
        public IActionResult Save([FromBody]JObject param = null)
        {
            ProductFamily prodFamily = null;

            var toSave = new List<IdentityModel>();

            try
            {
                prodFamily = Helper.JSonCamelDeserializeObject<ProductFamily>(param?.JGetPropVal<JObject>("data"));

                if (prodFamily != null)
                {
                    switch (prodFamily.RecordState)
                    {
                        case RecordState.Added:

                            if (prodFamily.Type_Id > 0 && prodFamily.Names?.Count > 0)
                            {
                                prodFamily.Slug = string.IsNullOrEmpty(prodFamily.Slug) ? prodFamily.Names[0].Value.ToSlug() : prodFamily.Slug;

                                toSave.Add(prodFamily);
                                toSave.AddRange(prodFamily.Names.Select(l => l.SetRecordState(RecordState.Added)));
                            }
                            break;

                        case RecordState.Updated:

                            if (prodFamily.ID > 0 && prodFamily.Type_Id > 0)
                            {
                                prodFamily.Slug = string.IsNullOrEmpty(prodFamily.Slug) ? prodFamily.Names[0].Value.ToSlug() : prodFamily.Slug;

                                toSave.Add(prodFamily);
                            }
                            break;

                        case RecordState.Deleted:

                            if (prodFamily.ID > 0)
                            {
                                toSave.AddRange(prodFamily.Names.Select(l => l.SetRecordState(RecordState.Deleted)));
                                toSave.Add(prodFamily);

                                prodFamily = null;
                            }
                            break;
                    }

                    if (prodFamily.Names?.Count > 0)
                    {
                        toSave.AddRange(prodFamily.Names.Where(l => l.RecordState == RecordState.Updated));
                    }

                    if (toSave.Count > 0)
                    {
                        _dbi.ManageIdentityModels(toSave.ToArray());

                        if (prodFamily != null)
                        {
                            if (prodFamily.RecordState != RecordState.Deleted)
                            {
                                prodFamily = _dbi.GetProductFamilys(slug: prodFamily.Slug, withNames: true).FirstOrDefault();
                            }
                        }
                    }
                }

                return Json(new { result = prodFamily?.Simplify() });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                prodFamily = null;
            }
        }
    }
}

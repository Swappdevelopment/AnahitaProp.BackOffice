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
    public class NeighbourhoodController : BaseController
    {
        public NeighbourhoodController(
            IConfigurationRoot config,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, dbOptns, injHolder)
        {
        }

        [HttpGet]
        [Access]
        public IActionResult Get()
        {
            Neighbourhood[] result = null;

            try
            {
                result = _dbi.GetNeighbourhoods(withNames: true);

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
        public IActionResult Save([FromBody]JObject param = null)
        {
            Neighbourhood nbh = null;

            var toSave = new List<IdentityModel>();

            try
            {
                nbh = Helper.JSonCamelDeserializeObject<Neighbourhood>(param);

                if (nbh != null)
                {
                    switch (nbh.RecordState)
                    {
                        case RecordState.Added:

                            if (nbh.Names?.Count > 0)
                            {
                                nbh.Slug = string.IsNullOrEmpty(nbh.Slug) ? nbh.Names[0].Value.ToSlug() : nbh.Slug;

                                toSave.Add(nbh);
                                toSave.AddRange(nbh.Names.Select(nm =>
                                {
                                    nm.AddCommand("Neighbourhood_Id", $"SELECT ID FROM Neighbourhoods WHERE Slug = '{nbh.Slug}' ");

                                    if (nm.Language_Id <= 0 && !string.IsNullOrEmpty(nm.Language?.Code))
                                    {
                                        nm.AddCommand("Language_Id", $"SELECT ID FROM Languages WHERE Code = '{nm.Language.Code}' ");
                                    }

                                    return nm.SetRecordState(RecordState.Added);
                                }));
                            }
                            break;

                        case RecordState.Updated:

                            if (nbh.ID > 0)
                            {
                                nbh.Slug = string.IsNullOrEmpty(nbh.Slug) ? nbh.Names[0].Value.ToSlug() : nbh.Slug;

                                toSave.Add(nbh);
                            }
                            break;

                        case RecordState.Deleted:

                            if (nbh.ID > 0)
                            {
                                toSave.AddRange(nbh.Names.Select(l => l.SetRecordState(RecordState.Deleted)));
                                toSave.Add(nbh);

                                nbh = null;
                            }
                            break;
                    }

                    if (nbh.Names?.Count > 0)
                    {
                        toSave.AddRange(nbh.Names.Where(l => l.RecordState == RecordState.Updated));
                    }

                    if (toSave.Count > 0)
                    {
                        _dbi.ManageIdentityModels(toSave.ToArray());

                        if (nbh != null && nbh.RecordState != RecordState.Deleted)
                        {
                            nbh = _dbi.GetNeighbourhoods(slug: nbh.Slug, withNames: true).FirstOrDefault();
                        }
                    }
                    else
                    {
                        nbh = null;
                    }
                }

                return Json(nbh == null ? new { ok = false } : nbh.Simplify());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                nbh = null;
            }
        }
    }
}

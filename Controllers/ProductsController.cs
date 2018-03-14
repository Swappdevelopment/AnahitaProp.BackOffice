using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using AnahitaProp.Data;
using AnahitaProp.Data.Models;
using Swapp.Data;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.IO;
using CoreFtp;
using CoreFtp.Enum;

namespace AnahitaProp.BackOffice
{
    public class ProductsController : BaseController
    {
        public ProductsController(
            IConfigurationRoot config,
            IHostingEnvironment env,
            DbContextOptionsWrapper dbOptns,
            InjectorObjectHolder injHolder)
            : base(config, env, dbOptns, injHolder)
        {
        }


        [HttpGet]
        [Access]
        [MenuRequirement("products>crud")]
        public async Task<IActionResult> Get(
            long productID = 0,
            long group_Id = 0,
            short? statusFilter = null,
            bool? hideSearchFilter = null,
            int offset = 0,
            int limit = 0,
            bool? withGroups = null,
            bool? withSubGroups = null,
            bool withProperties = false)
        {
            Product[] products = null;
            Property[] properties = null;

            try
            {
                await Task.WhenAll(
                    Helper.GetFunc(() =>
                    {
                        products = _dbi.GetListProducts(
                            productID: productID,
                            group_Id: group_Id,
                            withNames: true,
                            withGroups: withGroups,
                            withSubGroups: withSubGroups,
                            statusFilter: statusFilter,
                            hideSearchFilter: hideSearchFilter,
                            offset: offset,
                            limit: limit);

                        return Task.CompletedTask;
                    })(),
                    Helper.GetFunc(() =>
                    {
                        properties = withProperties ? _dbi.GetPropertysDetails() : null;

                        return Task.CompletedTask;
                    })());


                return Json(new { products = products?.Select(l => l.Simplify()).ToArray(), properties = properties?.Select(l => l.Simplify()).ToArray() });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                products = null;
                properties = null;
            }
        }


        [HttpGet]
        [Access]
        [MenuRequirement("products>crud")]
        public IActionResult GetProductPropertiesDetails()
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


        [HttpGet]
        [Access]
        [MenuRequirement("products>crud")]
        public IActionResult GetProductProjectsDetails()
        {
            Project[] result = null;

            try
            {
                result = _dbi.GetProjects(withNames: true);

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


        [HttpGet]
        [Access]
        [MenuRequirement("products>crud")]
        public IActionResult GetProductFlags(long productID = 0)
        {
            Product product = null;

            try
            {
                product = _dbi.GetProductsFlags(productID).FirstOrDefault();

                return Json(new
                {
                    productFlags = product?.Flags?.Select(l => l.Simplify()).ToArray(),
                    propertyFlags = product?.Property?.Flags?.Select(l => l.Simplify()).ToArray()
                });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                product = null;
            }
        }


        [HttpGet]
        [Access]
        [MenuRequirement("products>crud")]
        public IActionResult GetProductDescs(long productID = 0)
        {
            ProductFieldDesc[] descs = null;

            try
            {
                descs = _dbi.GetProductDescs(productID);

                return Json(descs == null ? new object[0] : descs.Select(l => l.Simplify()).ToArray());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                descs = null;
            }
        }


        [HttpGet]
        [Access]
        [MenuRequirement("products>crud")]
        public IActionResult GetProductFiles(long productID = 0)
        {
            ProductFile[] result = null;

            try
            {
                result = _dbi.GetProductFiles(productID);

                return Json(result == null ? new object[0] : result.Select(l => l.Simplify(true)).ToArray());
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
        [MenuRequirement("products>crud")]
        public IActionResult ChangeBoolean([FromBody]JObject param)
        {
            Product product = null;

            try
            {
                long id = param.JGetPropVal<long>("id");
                string action = param.JGetPropVal<string>("action");
                short? status = param.JGetPropVal<short?>("status");
                bool? hideSearch = param.JGetPropVal<bool?>("hideSearch");

                if (id > 0 && !string.IsNullOrEmpty(action))
                {
                    product = _dbi.GetProduct(id: id);

                    if (product != null)
                    {
                        product.RegisterForRecordStateChange();

                        switch (action.ToLower())
                        {
                            case "status":

                                if (status != null)
                                {
                                    product.Status = (ModelStatus)status.Value;
                                }

                                break;

                            case "hidesearch":

                                if (hideSearch != null)
                                {
                                    product.HideSearch = hideSearch.Value;
                                }

                                break;
                        }

                        product.RegisterForRecordStateChange();

                        product = _dbi.ManageModel(product);
                    }
                }

                return Json(product == null ? new { notFound = true } : product.Simplify());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                product = null;
            }
        }


        [HttpPost]
        [Access]
        [MenuRequirement("products>crud")]
        public IActionResult ChangeProductFileBoolean([FromBody]JObject param)
        {
            ProductFile productFile = null;

            try
            {
                long id = param.JGetPropVal<long>("id");
                long productId = param.JGetPropVal<long>("productId");
                string action = param.JGetPropVal<string>("action");
                bool? appearDetail = param.JGetPropVal<bool?>("appearDetail");
                bool? isListImage = param.JGetPropVal<bool?>("isListImage");
                short? status = param.JGetPropVal<short?>("status");

                if (id > 0 && !string.IsNullOrEmpty(action))
                {
                    productFile = _dbi.GetProductFiles(productId, productFileID: id).FirstOrDefault();

                    if (productFile != null)
                    {
                        productFile.RegisterForRecordStateChange();

                        switch (action.ToLower())
                        {
                            case "appeardetail":

                                if (appearDetail != null)
                                {
                                    productFile.AppearDetail = appearDetail.Value;
                                }

                                break;

                            case "islistimage":

                                if (isListImage != null)
                                {
                                    productFile.IsListImage = isListImage.Value;
                                }

                                break;

                            case "status":

                                if (status != null)
                                {
                                    productFile.Status = (ModelStatus)status.Value;
                                }

                                break;
                        }

                        productFile.RegisterForRecordStateChange();

                        productFile = _dbi.ManageModel(productFile);
                    }
                }

                return Json(productFile == null ? new { notFound = true } : productFile.Simplify());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                productFile = null;
            }
        }


        [HttpPost]
        [Access]
        [MenuRequirement("products>crud")]
        public IActionResult SaveBasics([FromBody]JObject param)
        {
            Product product = null;

            bool saved = false, hasNewPropFlags = false;

            List<IdentityModel> toSave = null;

            ProductSoldDate[] psds = null;

            string getProdIdQuery = null;

            IEnumerable<PropertyFlag> propertyFlags = null;


            try
            {
                product = Helper.JSonCamelDeserializeObject<Product>(param);

                product.Group_Id = product.Group_Id == 0 ? null : product.Group_Id;
                product.Project_Id = product.Project_Id == 0 ? null : product.Project_Id;
                product.Property_Id = product.Property_Id == 0 ? null : product.Property_Id;

                getProdIdQuery = $"SELECT ID FROM Products WHERE UID = '{product.UID}'";

                if (product != null)
                {
                    toSave = new List<IdentityModel>();

                    switch (product.RecordState)
                    {
                        case RecordState.Added:

                            product.UID = Helper.GenerateSequentialGuid().ToString();
                            getProdIdQuery = $"SELECT ID FROM Products WHERE UID = '{product.UID}'";

                            product.Slug = _dbi.GetProductSlug(product.Slug.ToSlug(length: Product.SLUG_LENGTH - 4));

                            toSave.Add(product);

                            if (product.Names != null)
                            {
                                toSave.AddRange(
                                        product.Names
                                        .Select(l =>
                                        {
                                            if (l.Language_Id <= 0 && !string.IsNullOrEmpty(l.Language?.Code))
                                            {
                                                l.AddCommand("Language_Id", $"SELECT ID FROM Languages WHERE Code = '{l.Language.Code.ToUpper()}' ");
                                            }

                                            return l.SetRecordState(RecordState.Added).AddCommand("Product_Id", getProdIdQuery);
                                        }));
                            }

                            if (product.Descs != null)
                            {
                                toSave.AddRange(
                                        product.Descs
                                        .Select(l => l.SetRecordState(RecordState.Added).AddCommand("Product_Id", getProdIdQuery)));
                            }

                            toSave.Add(new ProductSalePeriod()
                            {
                                RecordState = RecordState.Added,
                                DateFrom = DateTime.UtcNow,
                                DateTo = null,
                            }.AddCommand("Product_Id", getProdIdQuery));
                            break;

                        case RecordState.Updated:

                            toSave.Add(product);
                            break;
                        case RecordState.Deleted:
                            break;
                    }

                    if (product.Names != null)
                    {
                        toSave.AddRange(
                                product.Names
                                .Where(l => l.RecordState == RecordState.Deleted || l.RecordState == RecordState.Updated)
                                .Select(l =>
                                {
                                    l.Product_Id = product.ID;
                                    return l;
                                }));
                    }

                    if (product.Descs != null)
                    {
                        toSave.AddRange(
                                product.Descs
                                .Where(l => l.RecordState == RecordState.Deleted || l.RecordState == RecordState.Updated)
                                .Select(l =>
                                {
                                    l.Product_Id = product.ID;
                                    return l;
                                }));
                    }

                    if (product.Flags != null)
                    {
                        toSave.AddRange(from fl in product.Flags
                                        where fl.RecordState != 0
                                        select Helper.GetFunc<ProductFlag, ProductFlag>(pfl =>
                                        {
                                            if (product.RecordState == RecordState.Added)
                                            {
                                                pfl.AddCommand("Product_Id", $"SELECT ID FROM Products WHERE UID = '{product.UID}' ");
                                            }
                                            else
                                            {
                                                pfl.Product_Id = product.ID;
                                            }

                                            return pfl;
                                        })(fl));
                    }

                    if (product.Property != null)
                    {
                        if (product.Property.RecordState != RecordState.None)
                        {
                            toSave.Add(product.Property);
                        }

                        if (product.Property.Neighbourhood != null
                            && product.Property.Neighbourhood.RecordState != RecordState.None)
                        {
                            toSave.Add(product.Property.Neighbourhood);
                        }

                        if (product.Property.Names != null)
                        {
                            toSave.AddRange(product.Property.Names.Where(l => l.RecordState != RecordState.None));
                        }

                        if (product.Property.Flags != null)
                        {
                            toSave.AddRange(from fl in product.Property.Flags
                                            where fl.RecordState != 0
                                            select Helper.GetFunc<PropertyFlag, PropertyFlag>(pfl =>
                                            {
                                                if (product.Property.RecordState == RecordState.Added)
                                                {
                                                    pfl.AddCommand("Property_Id", $"SELECT ID FROM Propertys WHERE Code = '{product.Property.Code}' ");
                                                }
                                                else
                                                {
                                                    pfl.Property_Id = product.Property.ID;
                                                }

                                                switch (pfl.RecordState)
                                                {
                                                    case RecordState.Added:
                                                        hasNewPropFlags = true;
                                                        break;
                                                }

                                                return pfl;
                                            })(fl));
                        }
                    }


                    if (toSave.Count > 0)
                    {
                        foreach (var tempProd in toSave.OfType<Product>().ToArray())
                        {
                            psds = tempProd.ID > 0 ? _dbi.GetProductSoldDates(tempProd.ID) : null;

                            if (tempProd.Type == ProductType.Resale)
                            {
                                if (tempProd.Property_Id > 0)
                                {
                                    tempProd.Project_Id = null;

                                    if (psds == null || psds.Length == 0)
                                    {
                                        psds = new ProductSoldDate[]
                                        {
                                        new ProductSoldDate()
                                        {
                                            RecordState = RecordState.Added,
                                            DateSold = DateTime.UtcNow.AddDays(-7)
                                        }.AddCommand<ProductSoldDate>("Product_Id", getProdIdQuery)
                                        };
                                    }
                                }
                            }
                            else if (psds != null)
                            {
                                switch (tempProd.Type)
                                {
                                    case ProductType.Project:
                                        tempProd.Property_Id = null;
                                        break;
                                }

                                foreach (var psd in psds)
                                {
                                    psd.RecordState = RecordState.Deleted;
                                }
                            }

                            if (psds != null)
                            {
                                toSave.AddRange(psds.Where(l => l.RecordState != RecordState.None));
                            }
                        }

                        _dbi.ManageIdentityModels(toSave.ToArray());

                        saved = true;
                    }


                    bool clearProduct = true;

                    if (saved)
                    {
                        if (product.RecordState == RecordState.Added)
                        {
                            product = _dbi.GetListProducts(uid: product.UID, withNames: true)?.FirstOrDefault();

                            clearProduct = false;
                        }
                        else if (product.RecordState == RecordState.Deleted)
                        {
                            product = null;
                        }

                        if (hasNewPropFlags && product.Property_Id > 0)
                        {
                            propertyFlags = _dbi.GetProductsFlags(product.ID, includeProductFlags: false).FirstOrDefault()?.Property?.Flags;
                        }
                    }

                    product = clearProduct ? null : product;
                }

                return Json(new { saved, newProduct = product?.Simplify(), propertyFlags = propertyFlags?.Select(l => l.Simplify()).ToArray() });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                toSave?.Clear();
                toSave = null;
                product = null;
                propertyFlags = null;
            }
        }


        [HttpPost]
        [Access]
        [MenuRequirement("products>crud")]
        public IActionResult SaveProductFiles([FromBody]JObject param)
        {
            ProductFile[] files = null;

            List<IdentityModel> toSave = null;

            try
            {
                files = param?.JGetPropVal<ProductFile[]>("files")?.Where(l => l.RecordState != RecordState.None).ToArray();

                if (files != null && files.Length > 0)
                {
                    toSave = new List<IdentityModel>(files);

                    //toSave.AddRange(files
                    //                    .Where(l =>
                    //                        l.RecordState == RecordState.Deleted
                    //                        && l.File != null && l.File.ID > 0)
                    //                    .Select(l => l.File.SetRecordState(RecordState.Deleted)));


                    _dbi.ManageIdentityModels(toSave.ToArray());
                }


                return Json(new { });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                toSave?.Clear();
                toSave = null;

                files = null;
            }
        }


        [HttpPost]
        [Access]
        [MenuRequirement("products>crud")]
        public async Task<IActionResult> UploadProductImage(string data = null)
        {
            ProductFile prodFile = null;
            Data.Models.File file = null;
            IFormFile formFile = null;

            string fileName = null, fileFormat = null;

            try
            {
                if (Request != null
                    && Request.Form != null
                    && Request.Form.Keys != null
                    && Request.Form.Keys.Count > 0
                    && Request.Form != null
                    && Request.Form.Files != null)
                {
                    string key = Request.Form.Keys.FirstOrDefault(l => l.StartsWith("ProdFileID"));

                    if (!string.IsNullOrEmpty(key))
                    {
                        prodFile = Helper.JSonCamelDeserializeObject<ProductFile>(Request.Form[key]);

                        if (prodFile != null && prodFile.Product_Id > 0)
                        {
                            formFile = Request.Form.Files.FirstOrDefault(f => f.Name == key);

                            if (formFile != null && !string.IsNullOrEmpty(formFile.FileName))
                            {
                                int offset = 0;

                                if (Request.Form.Keys.Any(k => k == "offset"))
                                {
                                    if (!int.TryParse(Request.Form["offset"].ToString(), out offset))
                                    {
                                        offset = 0;
                                    }
                                }

                                fileName = _dbi.GetProductFileName(prodFile.Product_Id, offset: offset);
                                fileFormat = Path.GetExtension(formFile.FileName);
                                fileFormat = fileFormat.StartsWith(".") ? fileFormat : $".{fileFormat}";

                                file = new Data.Models.File()
                                {
                                    RecordState = RecordState.Added,
                                    UID = fileName.ToSlug(),
                                    Name = fileName,
                                    Format = fileFormat,
                                    IsImage = true,
                                    IsUploaded = false
                                };

                                file = _dbi.ManageModel(file);

                                prodFile.File_Id = file.ID;
                                prodFile.RecordState = RecordState.Added;
                                prodFile = _dbi.ManageModel(prodFile);

                                prodFile.File = file;



                                string ftpHost = _config["Ftp:assets:host"];
                                string ftpUserName = _config["Ftp:assets:user"];
                                string ftppassword = _config["Ftp:assets:password"];
                                bool ftpIgnoreCertificateErrors = true;


                                using (var ftpClient = new FtpClient(
                                                    new FtpClientConfiguration()
                                                    {
                                                        Host = ftpHost,
                                                        Username = ftpUserName,
                                                        Password = ftppassword,
                                                        EncryptionType = FtpEncryption.Implicit,
                                                        IgnoreCertificateErrors = ftpIgnoreCertificateErrors
                                                    }))
                                {
                                    await ftpClient.LoginAsync();

                                    using (var fileStream = formFile.OpenReadStream())
                                    {
                                        string ftpFilePath = $"/wwwroot/images/{file.UID}/optz/{fileName}{fileFormat}";

                                        using (var writeStream = await ftpClient.OpenFileWriteStreamAsync(ftpFilePath))
                                        {
                                            await fileStream.CopyToAsync(writeStream);
                                        }
                                    }
                                }

                                file.IsUploaded = true;
                                file = _dbi.ManageModel(file);
                            }
                        }
                    }
                }

                return Json(prodFile.Simplify(true));
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
            finally
            {
                prodFile = null;
                formFile = null;
            }
        }
    }
}

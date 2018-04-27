import fs from 'fs';
import path from 'path';
import parser from 'xml2json';
import { Parser as csvParser } from 'json2csv';

const xmlsPath = path.join(__dirname, '/xmls/')
const fields = ['fecha', 'subtotal', 'formaPago', 'total', 'iva', 'rfc'];
const cfdiInfo = [];

fs
  .readdirSync(xmlsPath)
  .filter(
    (file) =>
      file.indexOf('.') !== 0 && file.slice(-4) === '.xml',
  )
  .forEach((file) => {
    const xml = fs.readFileSync(path.join(xmlsPath, file), {encoding: 'utf-8'});
    const jsonResult = JSON.parse(parser.toJson(xml));
    cfdiInfo.push({
      fecha: jsonResult["cfdi:Comprobante"].Fecha,
      subtotal: jsonResult["cfdi:Comprobante"].SubTotal,
      formaPago: jsonResult["cfdi:Comprobante"].FormaPago,
      total: jsonResult["cfdi:Comprobante"].Total,
      iva: jsonResult["cfdi:Comprobante"]["cfdi:Impuestos"].TotalImpuestosTrasladados,
      rfc: jsonResult["cfdi:Comprobante"]["cfdi:Emisor"].Rfc
    });
  });

const json2csvParser = new csvParser({ fields });
const csv = json2csvParser.parse(cfdiInfo);

const csvFile = fs.createWriteStream(path.join(__dirname, '/output/cfdiInfo.csv'));
csvFile.write(csv);
csvFile.end();

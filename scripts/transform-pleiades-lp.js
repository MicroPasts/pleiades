/**
 * This script processes a CSV file containing heritage site data, transforms it into GeoJSON format, 
 * and writes the resulting data to a JSON file. The script includes functions to generate GeoJSON 
 * objects, metadata, types, depictions, and links based on the provided data.
 *
 * @file /heritage-at-risk/scripts/transform-har-lp-enhanced.js
 * @requires fs - The Node.js File System module to read and write files.
 * @requires Papa - The PapaParse library to parse CSV data.
 * @requires commons - A module to generate Wikimedia Commons file paths.
 * @requires moment - The Moment.js library to handle date formatting.
 */
import fs, { link } from 'fs';
import Papa from 'papaparse';
import commons from 'wikimedia-commons-file-path';
import moment from 'moment';

/**
 * Creates a GeoJSON Point object from longitude and latitude.
 *
 * @param {number|string} lon - The longitude of the point.
 * @param {number|string} lat - The latitude of the point.
 * @returns {Object} A GeoJSON Point object with the specified coordinates.
 */
const getPlace = (lon,lat) => {
   
    return {
        type: 'Point',
        coordinates: [ parseFloat(lon), parseFloat(lat) ]
    };

}

/**
 * Generates an indexing object for the Heritage-at-Risk dataset.
 *
 * @returns {Object} An object containing metadata for the Heritage-at-Risk dataset.
 * @returns {string} @returns.@context - The context URL for the schema.
 * @returns {string} @returns.@type - The type of the schema object.
 * @returns {string} @returns.name - The name of the dataset.
 * @returns {string} @returns.description - A description of the dataset.
 * @returns {string} @returns.license - The license URL for the dataset.
 * @returns {string} @returns.identifier - The identifier URL for the dataset.
 */
const getIndexing = () => {
    return  {
        "@context": "https://schema.org/",
        "@type": "Dataset",
        "name": "Pleiades - AWMC on Peripleo",
        "description": "An enriched dataset of Heritage at Risk entries in England",
        "license": "https://creativecommons.org/licenses/by/3.0/",
        "identifier": "https://atlantides.org/downloads/pleiades/dumps/"
    }
}



const getTypes = (properties) => {
    const wikiInstanceOf = properties.wikiInstanceOf ? 'https://www.wikidata.org/wiki/' + properties.wikiInstanceOf : null;
    const wikidataEntityID  = properties.wikidataEntityID ? 'https://www.wikidata.org/wiki/' + properties.wikidataEntityID : null;
    const heritageCategory = properties.heritage_category;
    const siteSubType = properties.site_sub_type;
    const types = [];

    if (wikiInstanceOf && siteSubType) {
        types.push({
            identifier: wikiInstanceOf,
            label: 'A Wikidata type: ' + siteSubType
        });
    }

    if (wikidataEntityID && heritageCategory) {
        types.push({
            identifier: wikidataEntityID,
            label: 'A Wikidata type: ' + heritageCategory
        });
    }

    const flatTypes = types.reduce((all, type) => {
        return {
            ...all,
            types: [
            ...(all.types || []),
            {
                identifier: type.identifier,
                label: type.label
            }
            ]
        };
    }, {});
    return flatTypes;
}

/**
 * Generates a depiction object for a heritage site based on the provided row data.
 *
 * @param {Object} row - The data row containing information about the heritage site.
 * @param {string} row.image_path_commons - The path to the image on Wikimedia Commons.
 * @returns {Object|undefined} An object containing depictions of the heritage site, or undefined if no image path is provided.
 */
const getDepiction = (row) => {
    if (!row.image_path_commons) return;
    const wikicommons = commons('File:' + row.image_path_commons, 800);
    return {
        depictions: [{
            '@id': wikicommons,
            thumbnail: wikicommons,
            label: 'A depiction of the heritage site sourced via Wikimedia Commons'
        }]
    };
}

const getLinks = (properties) => {
    const urls = {
        pleiadesID: 'https://pleiades.stoa.org/places/',
    };

    const labels = {
        pleiadesID: 'A place on Pleiades: '
    };

    const links = Object.keys(urls).reduce((acc, key) => {
        if (properties[key]) {
            acc.push({
                identifier: urls[key] + properties[key],
                type: 'seeAlso',
                label: labels[key] + (key === 'hasConnectionsWith' ? '' : properties[key])
            });
        }
        return acc;
    }, []);

    return { links };
}

/**
 * Builds a feature object from the given parameters.
 *
 * @param {Object} record - The record object containing initial properties.
 * @param {string} place - The place name associated with the feature.
 * @param {string} lon - The longitude coordinate of the feature.
 * @param {string} lat - The latitude coordinate of the feature.
 * @param {Object} row - The row object containing additional data for the feature.
 * @returns {Object|undefined} The constructed feature object or undefined if place and lon are not provided.
 */
const buildFeature = (record, place, lon, lat, row) => {
    console.log(record)
    if (!place?.trim() && !lon?.trim())
        return;

    return {
        ...record,
        properties: {
            ...record.properties,
            place: place.trim(),
        },
        geometry: {
            ...getPlace(lon,lat)
        },
        
            ...getDepiction(row)
        ,
            ...getTypes(row) 
        ,
            ...getLinks(row)
        
    }
}


/**
 * Reads the content of the CSV file located at '../rawData/har-lp-ready-csv-enhanced.csv' 
 * and stores it in the `recordsCsv` variable.
 *
 * @constant {string} recordsCsv - The content of the CSV file as a UTF-8 encoded string.
 * @requires fs - The Node.js File System module to read the file.
 */
const recordsCsv = fs.readFileSync('../csv/pleiades-places.csv', { encoding: 'utf8' });

/**
 * Parses a CSV string into an array of objects using PapaParse.
 *
 * @param {string} recordsCsv - The CSV string to be parsed.
 * @returns {Object[]} An array of objects representing the parsed CSV records.
 */
const records = Papa.parse(recordsCsv, { header: true });


const features = records.data.map(row => {
    const {
        authors,bbox,connectsWith,created,creators,currentVersion,
        description,extent,featureTypes,geoContext,hasConnectionsWith,
        id,locationPrecision,maxDate,minDate,modified,path,reprLat,
        reprLatLong,reprLong,tags,timePeriods,timePeriodsKeys,timePeriodsRange,
        title,uid

    } = row;
    const source = 'https://pleiades.stoa.org/places/' + id;
    const place = title;
    const formatDate = dateString => moment(dateString, "YYYY-MM-DD").format("DD/MM/YYYY");
    const formattedDate = formatDate(created);
    const yearAdded = moment(formattedDate, "DD/MM/YYYY").year().toString() || null;
    const modifiedDate = formatDate(modified);
    const placeTypes = featureTypes ? featureTypes.split(',') : [];
    const fields = [
        { label: 'Title', value: title },
        { label: 'Created', value: formattedDate ? formattedDate : null },
        { label: 'Last updated', value: modifiedDate ? modifiedDate : null },
        { label: 'Authors', value: authors },
        { label: 'Year added', value: yearAdded },
        { label: 'Time periods associated', value: timePeriods},
        { label: 'Location precision', value: locationPrecision },
        { label: 'Minimum date', value: minDate },
        { label: 'Maximum date', value: maxDate },
        { label: 'Has connections with', value: hasConnectionsWith },
        { label: 'Place types', value: placeTypes[1] }
    ];

    const trimmedDescription = description.trim().replace(/\n/g, '');
    
    const peripleoRecord = {
        '@id': source.trim(),
        type: 'Feature',
        properties: {
            title,formattedDate,modifiedDate,authors,yearAdded,hasConnectionsWith,timePeriods, locationPrecision, minDate, maxDate, placeTypes
        },
        description: [{ value: trimmedDescription }]
    };

    if (locationPrecision && locationPrecision.trim() !== 'unlocated') {
        return buildFeature(peripleoRecord, place, reprLong, reprLat, row);
    }
}).filter(Boolean);
const indexing = getIndexing();
const fc = {
    type: 'FeatureCollection',
    indexing,
    features
};

/**
 * Writes the GeoJSON FeatureCollection object to a JSON file located at '../docs/data/harLP.json'.
 *
 * @requires fs - The Node.js File System module to write the file.
 */
fs.writeFileSync('../docs/data/pleiades.json', JSON.stringify(fc, null, 2), 'utf8');
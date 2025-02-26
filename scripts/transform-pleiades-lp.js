/**
 * This script processes a CSV file containing heritage site data, transforms it into GeoJSON format, 
 * and writes the resulting data to a JSON file. The script includes functions to generate GeoJSON 
 * objects, metadata, types, depictions, and links based on the provided data.
 *
 * @file /pleiades-peripleo/scripts/transform-har-lp-enhanced.js
 * @requires fs - The Node.js File System module to read and write files.
 * @requires Papa - The PapaParse library to parse CSV data.
 * @requires commons - A module to generate Wikimedia Commons file paths.
 * @requires moment - The Moment.js library to handle date formatting.
 * 
 * Usage - node ./trasnform-pleiades-lp.js
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
 * Generates an indexing object for the Pleiades dataset.
 *
 * @returns {Object} An object containing metadata for the Pleiades dataset.
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
        "description": "An enriched dataset of Pleiades data",
        "license": "https://creativecommons.org/licenses/by/3.0/",
        "identifier": "https://atlantides.org/downloads/pleiades/dumps/"
    }
}



/**
 * Extracts and transforms types from the given properties object.
 *
 * @param {Object} properties - The properties object containing type information.
 * @param {string} [properties.wikiInstanceOf] - The Wikidata instance of identifier.
 * @param {string} [properties.wikidataEntityID] - The Wikidata entity ID.
 * @param {string} [properties.heritage_category] - The heritage category of the site.
 * @param {string} [properties.site_sub_type] - The sub-type of the site.
 * @returns {Object} An object containing the transformed types.
 */
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
 * @param {string} row.commonsID - The path to the image on Wikimedia Commons.
 * @returns {Object|undefined} An object containing depictions of the heritage site, or undefined if no image path is provided.
 */
const getDepiction = (row) => {
    if (!row.commonsID) return;
    const wikicommons = commons('File:' + row.commonsID, 800);
    return {
        depictions: [{
            '@id': wikicommons,
            thumbnail: wikicommons,
            label: 'A depiction of the heritage site sourced via Wikimedia Commons'
        }]
    };
}


/**
 * Generates an array of link objects based on the provided properties.
 *
 * @param {Object} properties - The properties object containing various identifiers.
 * @param {string} [properties.item] - The Wikidata entity ID.
 * @param {string} [properties.wikipedia_en] - The Wikipedia page name.
 * @param {string} [properties.geonames_ids] - The Geonames ID.
 * @param {string} [properties.nomisma_ids] - The Nomisma ID.
 * @returns {Object} An object containing an array of link objects.
 * @returns {Array} return.links - The array of link objects.
 * @returns {string} return.links[].identifier - The full URL of the link.
 * @returns {string} return.links[].type - The type of the link, always 'seeAlso'.
 * @returns {string} return.links[].label - The label for the link.
 */
const getLinks = (properties) => {
    const urls = {
        item: 'http://www.wikidata.org/entity/',
        wikipedia_en: 'https://en.wikipedia.org/wiki/',
        geomes_ids: 'https://www.geonames.org/',
        nomisma_ids: 'https://nomisma.org/id/',
        gettytgn_ids: 'http://vocab.getty.edu/page/tgn/',
        loc_ids: 'https://id.loc.gov/authorities/subjects/',
        viaf_ids: 'https://viaf.org/viaf/',
        trismegistos_ids: 'https://www.trismegistos.org/text/'
    };

    const labels = {
        item: 'A Wikidata entity: ',
        wikipedia_en: 'A Wikipedia page: ',
        geomes_ids: 'A Geonames page: ',
        nomisma_ids: 'A Nomisma ID: ',
        gettytgn_ids: 'A Getty TGN ID: ',
        loc_ids: 'A Library of Congress ID: ',
        viaf_ids: 'A VIAF ID: ',
        trismegistos_ids: 'A Trismegistos text: '
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
const recordsCsv = fs.readFileSync('../csv/pleiades.csv', { encoding: 'utf8' });

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
        title,uid,chronique_ids,dare_ids,geomes_ids,gettytgn_ids,idaigaz_ids,loc_ids,manto_ids,nomisma_ids,
        topostext_ids,trismegistos_ids,viaf_ids,vici_ids,wikipedia_en,commonsID

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

    const trimmedDescription = description.trim().replace(/\n/g, '') + '<br/>Authors: ' + authors.trim().replace(/\n/g, '')
    +  '<br/>Time periods associated: ' + timePeriodsKeys.trim().replace(/\n/g, '') 
    + '<br/>PleiadesID: ' + id.trim().replace(/\n/g, '');
    
    const replaceHyphensInTimePeriodRange = (range) => {
        if (!range) return range;
        return [range.split('-').join(' to ')];
    };

    const timePeriodsKeysFormatted = replaceHyphensInTimePeriodRange(timePeriodsKeys);
    const peripleoRecord = {
        '@id': source.trim(),
        type: 'Feature',
        properties: {
            title,formattedDate,modifiedDate,authors,yearAdded,hasConnectionsWith,timePeriods, locationPrecision, minDate, maxDate, placeTypes, timePeriodsKeysFormatted, timePeriodsRange,
            geomes_ids,gettytgn_ids,idaigaz_ids,loc_ids,nomisma_ids,trismegistos_ids,viaf_ids,wikipedia_en,commonsID
        },
        descriptions: [{ value: trimmedDescription }]
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
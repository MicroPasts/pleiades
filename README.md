# Heritage at Risk Mapping

[![ORCiD](https://img.shields.io/badge/ORCiD-0000--0002--0246--2335-green.svg)](http://orcid.org/0000-0002-0246-2335) [![DOI](https://zenodo.org/badge/914311737.svg)](https://doi.org/10.5281/zenodo.14772487)


This project uses Peripleo to map [heritage at risk data](https://historicengland.org.uk/advice/heritage-at-risk/) from [Historic England](https://historicengland.org.uk) and avoids the costs of using ESRI. Peripleo is a powerful tool for visualizing and exploring geospatial data, making it ideal for showcasing heritage sites that are at risk.

A methods paper will be forthcoming on this, which will document the processes and decisions made to make this and some background to Historic England's Digital Strategy 2022 - 2025.

This demonstration is served off GitHub pages, with no cost burden. 

**Note: This project is not endorsed by Historic England, it is an independent demo**

<img width="959" alt="image" src="https://github.com/user-attachments/assets/bf334ad5-cdde-49ed-b0a3-424d8be6ba6e" />

## Overview

The Heritage at Risk Mapping project aims to provide an interactive map that highlights heritage sites identified by Historic England as being at risk. This visualization helps in raising awareness and promoting efforts to preserve these important cultural landmarks.

## Features

- Interactive map displaying heritage at risk sites
- Detailed information about each site, including its risk status
- Search and filter functionality to explore specific areas or types of heritage

## Data Source

The data for this project is sourced from Historic England's Heritage at Risk Register. This register includes buildings, monuments, and other heritage assets that are at risk due to neglect, decay, or inappropriate development.

## Getting raw data

Within the [scripts](/scripts) folder, a single R file is available that generates the raw csv and scraped data from Historic England. An [ipython notebook](/notebooks/harPeripleo.ipynb) using an R kernel walks you through this and provides access to [raw csv files](/notebooks/csv/), the [merged data](/notebooks/merged/) and finally the data ready to use in [openrefine](/notebooks/final/openrefineHAR.csv). Also included is a notebook documenting the steps to use [openrefine commands](/notebooks/openrefine.ipynb) to enrich these data.

## Openrefine

The final data set from the HE website is then manipulated via the use of Openrefine, and a formatted markdown table of the commands used to manipulate data is available in the [notebooks folder](/notebooks/openrefine-commands.md) which is created from an exported [openrefine json](/notebooks/openrefine/json/openrefine-commands.json) file (you can reuse this).

## Tutorials and notebooks

Included in this repository are three tutorial files.

1. [Building a customised Peripleo](/tutorial/customising-peripleo.md):  The Peripleo instance used here has had a few enhancements/changes applied to it. I have changed the infocards, type rendering and links from the Linked Places GeoJSON and amended colours. Changes were made in the peripleo folder.
2. [Using openrefine](/tutorial/openrefine.md): How to get enhanced data via the use of Openrefine. 
3. How this instance of [Peripleo was configured](/notebooks/configurePeripleo.ipynb).

Guidance on how to configure Peripleo can be found on the [British Library's pages](https://github.com/britishlibrary/peripleo-lanc/) for this project.

## Contributing

We welcome contributions to the project. If you have suggestions or improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for more details.

## Acknowledgements

- Historic England for providing the Heritage at Risk data
- The Peripleo team for developing and maintaining the mapping tool

## Contact

For any questions or inquiries put an issue in and I'll respond.

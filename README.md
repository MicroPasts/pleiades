# Pleiades demo of Peripleo

[![ORCiD](https://img.shields.io/badge/ORCiD-0000--0002--0246--2335-green.svg)]

![A social media card showing an AI generated image of a Roman ruin](https://micropasts.github.io/pleiades/social-media-preview.jpeg)
> Prompt to create image in Microsoft copilot: Roman ruins in Italy with the words Pleiades and LAWD overlaid at the top right.

## Introduction

This project demonstrates the use of Peripleo to map Linked Ancient World Data (LAWD) from the Pleiades project. Peripleo is a powerful tool for visualizing and exploring historical geographic data.

## How were these data prepared?

1. Download latest [pleiades places csv](https://atlantides.org/downloads/pleiades/dumps/)
2. Download [Tom Elliott's](https://github.com/paregorios) [Wikidata enriched dataset from Github](https://github.com/isawnyu/pleiades_wikidata)
3. Use the R script to merge these two files
4. Use openrefine to get json data from wikidata to get commons image identifiers
5. Use the node script to transfrom these data to Linked Pasts

## Linked Open Data

This project integrates Linked Open Data from various sources to enrich the mapping experience:

- **Wikidata**: A free and open knowledge base that can be read and edited by both humans and machines.
- **VIAF**: The Virtual International Authority File combines multiple name authority files into a single OCLC-hosted name authority service.
- **Wikipedia**: A free online encyclopedia, created and edited by volunteers around the world.
- **Trismegistos**: An interdisciplinary portal of papyrological and epigraphical resources.
- **Nomisma**: A collaborative project to provide stable digital representations of numismatic concepts.
- **Library of Congress**: The research library that officially serves the United States Congress.
- **Geonames**: A geographical database available and accessible through various web services.
- **Getty**: The Getty Thesaurus of Geographic Names (TGN) is a structured vocabulary containing names and other information about places.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Acknowledgements

Special thanks to the following individuals for their contributions and support:

- **Tom Elliott**: For his work on the Pleiades project.
- **Elton Barker**: For his contributions to the study of ancient geography.
- **Rainer Simon**: For developing Peripleo and his ongoing support.

## Contact

For any questions or inquiries, please contact the project maintainers.

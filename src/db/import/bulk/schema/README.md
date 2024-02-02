# TODOs
* how to marry schema_area and schema_climbs together, since area.children assumes UUIDs as children (instead of area objects)
* `climb._id` should be `climb.id`, since `_id` is Mongos internal representation (byte object), whereas `id` would be a UUID string -> how do we go about making the JSON schema compatible for end users?
* how to distinguish the schema between CREATE and UPDATE? (update needs `id`s, create does not)


* Validate & Render Schema Client-Side

# Bulk Upload of Data
TODO Description

# Schema
## General Data Hierarchy
This is how OpenBeta's data is structured. Generally, the database schema distinguishes between `Area`s and `Climb`s :
> - Country (`Area`)
>   - Region (`Area`)
>     - Sub-Region (`Area`)
>       - Sub-Sub-Region (`Area`)
>         - Crag 1 (`Area`)
>           - Sector 1 (`Area`)
>           - Sector 2 (`Area`)
>           - Sector N (`Area`)
>             - Climb 1 (`Climb`)
>             - Climb 2 (`Climb`)
>             - Climb N (`Climb`)
>               - Pitch 1 (`Climb.Pitch`)
>               - Pitch 2 (`Climb.Pitch`)
>         - Crag 2 (`Area`)
>         - Crag N (`Area`)


## Example
Let's look at `example_upload.json` for an illustration:

> - USA (Country, Type: `Area`)
>  - Utah (State, Type: `Area`)
>     - Southeast Utah (Region, Type: `Area`)
>        - Indian Creek (Crag, Type: `Area`)
>           - Supercrack Buttress (Sector, Type: `Area`)
>              - The Key Flake (Route, Type: `Climb`)
>              - Incredible Hand Crack (Route, Type: `Climb`)
>                  - Pitch 1 (Pitch, Type: `Climb.Pitch`)
>                  - Pitch 2 (Pitch, Type: `Climb.Pitch`)

### A note on `area`s
* an `area` may be a country, state, region, crag or sector (and may be infinetely nested)
* it is only the leaf area node that determines its type 
   * e. g. an area with climbs == a sector (metadata property `isLeaf` must be set to `TRUE`)
   * hence, an area with sectors == a crag
   * if an area has only boulders as children, it's a boulder field (metadata property `isBoulder` must be set to `TRUE`)


# General Notes
* Use `example_upload.json` for general guidance on how to structure your JSON file for mass upload

* Find all current database data here: https://github.com/OpenBeta/openbeta-export/tree/production (updated nightly)

# How to Update Data
* Update options
    * to add climbs: use the schema
    * to update climbs: download export (link: TODO), change relevant data, re-upload here
    * to delete climbs: must be done via ... TODO

* the use of `id`s:
    * omitting an id = **creates** new entries
    * providing an id = **updates** existing entries
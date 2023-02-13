class WMTSLayer {
    constructor(ckanLayer) {
        this.id = ckanLayer.id;
        this.title = ckanLayer.title;
        this.checked = ckanLayer.defaultOn;
        this.reference = ckanLayer.isBackground;
        this.type = "wmts";
        this.layerInfo = {
            id: ckanLayer.id,
            type: "raster",
            metadata: {
                title: ckanLayer.title,
                abstract: ckanLayer.description,
                imageUrl: ckanLayer.imageUrl,
                legendurl: ckanLayer.legendUrl
            },
            source: {
                tiles: [`${ckanLayer.settings.url}/${ckanLayer.settings.featureName}/EPSG:3857/{z}/{x}/{y}.png`],
                type: "raster"
            }
        }
        if (ckanLayer.attribution) {
            this.layerInfo.source.attribution = ckanLayer.attribution;
        }
    }
}



export class CkanConnector {
    endpointGroups = "api/3/action/group_list";
    endpointLayers = "api/3/action/package_search";
    constructor(settings = {
        url: "https://data.beta.geodan.nl",
        organizations: ["kadaster_"]
    }) {
        this.settings = settings;
    }
    convertToMapboxLayers(data) {
        const result = [];
        if (data.success) {
            const groups = new Map();
            for (const layer of data.layerConfigs) {
                let resultLayer = {
                    id: layer.id,
                    title: layer.title,
                    checked: layer.defaultOn,
                    reference: layer.isBackground,
                    layerInfo: {
                        id: layer.id,
                        metadata: {
                            title: layer.title,
                            abstract: layer.description,
                            imageUrl: layer.imageUrl,
                            legendurl: layer.legendUrl
                        },
                        source: {
                            tiles: [layer.settings.url],
                            attribution: layer.attribution,
                            
                        }
                    }
                }
                if (resultLayer.layerInfo.source.attribution === undefined) {
                    delete resultLayer.layerInfo.source.attribution;
                }
                switch(layer.type) {
                    case 'wmts':
                        resultLayer = new WMTSLayer(layer);
                        break;
                    case 'wms':
                        if (resultLayer.layerInfo.source.tiles[0].toUpperCase().indexOf("REQUEST=GETCAPABILITIES") !== -1) {
                            resultLayer.type = "getcapabilities";
                            resultLayer.layerInfo = {
                                id: layer.id,
                                url: resultLayer.layerInfo.source.tiles[0]
                            }
                        } else {
                            resultLayer.type = "wms";
                            resultLayer.layerInfo.type = "raster";
                            resultLayer.layerInfo.source.type = "raster";
                            if (resultLayer.layerInfo.source.tiles[0].indexOf("?") === -1) {
                                resultLayer.layerInfo.source.tiles[0] += `?layers=${layer.settings.featureName}`;
                            } else {
                                resultLayer.layerInfo.source.tiles[0] += `&layers=${layer.settings.featureName}`;
                            }
                        }
                }
                if (resultLayer.type) {
                    // only add layers with supported type
                    if (layer.groupId) {
                        let layerGroup = groups.get(layer.groupId);
                        if (!layerGroup) {
                            groups.set(layer.groupId, [resultLayer]);
                        } else {
                            layerGroup.push(resultLayer);
                        }
                    } else {
                        result.push(resultLayer);
                    }
                }
            }
            for (const [key, value] of groups) {
                const groupData = data.groups.result.find(group=>group.id === key);
                const groupInfo = {
                    type: "group",
                    title: groupData.title,
                    id: groupData.id,
                    sublayers: value
                }
                // todo: handle parent groups
                result.push(groupInfo);
            }
        }
        return result;
    }
    async getData() {
        if (!this.data) {
            try {                
                const groups = await this._getAllGroups();
                const layerConfigs = [];

                for(let i = 0; i < this.settings.organizations.length; i++) {
                    const configs = await this._getAllLayerConfigs(this.settings.organizations[i]);
                    layerConfigs.push(...configs);
                }
            

                // ToDo: filter out groups without layers

                this.data = {success: true, groups, layerConfigs};// new LibraryConnectorData(groups, layerConfigs);
            } catch (error) {
                throw error;
            }
        }

        return this.data;
    }

    /**
     * Request all groups from CKAN, include groups for subgroups
     * @returns List of LayerGroup
     */
    async _getAllGroups() {
        try {
            const request = `${this.settings.url}/${this.endpointGroups}?all_fields=true&include_extras=false&include_tags=false&include_groups=true`;
            const result = await this._fetchJson(request);

            if (result.success) {
                return result;

                //return this.ckanGroupsToLayerGroups(result.result ?? []);
            } else {
                throw new Error("CKAN Connector: Get groups request unsuccessful")
            }
        } catch (error) {
            throw error;
        }
    }

    async _fetchJson(url) {
        let result = {success: false};
        const response = await fetch(url);
        if (response.ok) {
            result = await response.json();
            if (result.success === undefined) {
                result.success = true;
            }
        }
        return result;
    }

    /**
     * Request all packages and resources from CKAN
     * @returns List of LayerConfigs parsed from CKAN packages
     */
    async _getAllLayerConfigs(organization) {
        try {
            const request = `${this.settings.url}/${this.endpointLayers}?q=organization:${organization}&facet=false&rows=1000`;
            const result = await this._fetchJson(request);
            
            if (result.success) {
                return this._ckanPackagesToLayerConfigs(result);
            } else {
                throw new Error("CKAN Connector: Get layers request unsuccessful")
            }
        } catch (error) {
            throw error;
        }
    }
    _ckanPackagesToLayerConfigs(result) {
        const configs = [];

        if(!result?.result?.results) {
            return configs;
        }

        const packages = result.result.results;        

        for(let i = 0; i < packages.length; i++) {
            const pack = packages[i];
            const groupID = pack.groups && pack.groups.length > 0 ? pack.groups[0].id : undefined;            
            const metadata = pack.extras;
            const attribution = pack.license;
            const description = pack.notes;
            const resources = pack.resources;

            if(resources) {
                const converted = this._ckanResourcesToLayerConfigs(resources, groupID, attribution, description, metadata);                
                configs.push(...converted);
            }
        }

        if(this.debug) {
            for(let i = 0; i < configs.length; i++) {
              //  console.log(configs[i]);
            }
        }

        return configs;
    }
    _ckanResourcesToLayerConfigs(resources, groupID, attribution, description, metadata) {
        const configs = [];

        for(let i = 0; i < resources.length; i++) {
            const resource = resources[i];
            let resourceDescription = description;

            if(resource.description) {
                resourceDescription = `${resource.description}\n${resourceDescription}`;
            }

            let settings = {};
            let cameraPosition = undefined;

            if(resource.settings){
                try {
                    settings = JSON.parse(resource.settings);   
                }
                catch(Error){}
            }

            if(resource.cameraPosition) {
                try {
                    cameraPosition = JSON.parse(resource.cameraPosition);
                } catch (error) {}
            }

            if(!settings.url && resource.url) {
                settings.url = resource.url;
            }

            const lc = {
                id: resource.id,
                type: resource.format.toLowerCase(),
                title: resource.name,
                description: resourceDescription,
                groupId: groupID,
                imageUrl: resource.imageUrl ? resource.imageUrl : this._getValueFromMetadata("Preview afbeelding", metadata),
                attribution: attribution,
                isBackground: resource.isBackground !== undefined ? true : false,
                legendUrl: resource.legendUrl,
                defaultAddToManager: resource.defaultAddToManager !== undefined ? true : false,
                defaultOn: resource.defaultOn !== undefined ? true : false,
                metadata: metadata,
                settings: settings,
                cameraPosition: cameraPosition
            };
            
            configs.push(lc);
        }

        return configs;
    }

    _getValueFromMetadata(key, metadata) {
        const result = metadata.find(m => m.key === key);
        return result ? result.value : undefined;
    }


}
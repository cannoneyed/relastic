transforms.filterByOfficeOrProjectLocation = function (body, params, type) {
    var filter = body.query.filtered.filter.bool
    filter.must = filter.must || []

    if (params.lat && params.lng) {
        params.radius = Number(params.radius) || 1000;

        if (params.keywords.length && params.keywords.indexOf("General Contracting") === -1) {
            filter.must.push({
                nested: {
                    path: 'projects',
                    filter: {
                        bool: {
                            must: [{
                                geo_distance: {
                                    distance: params.radius ? (params.radius + "mi") : "1000mi",
                                    'projects.location': {
                                        lat: Number(params.lat),
                                        lon: Number(params.lng)
                                    }
                                }
                            }, {
                                terms: {
                                    'projects.keywords': params.keywords
                                }
                            }]
                        }
                    }
                }
            });
        } else {
            filter.must.push({
              bool : {
                should: [{
                  nested: {
                    path: 'projects',
                    filter: {
                      geo_distance: {
                        distance: params.radius ? (params.radius + "mi") : "1000mi",
                        'projects.location': {
                          lat: Number(params.lat),
                          lon: Number(params.lng)
                        }
                      }
                    }
                  }
                },
                {
                  nested: {
                    path: 'offices',
                    filter: {
                      geo_distance: {
                        distance: params.radius ? (params.radius + "mi") : "1000mi",
                        'offices.location': {
                          lat: Number(params.lat),
                          lon: Number(params.lng)
                        }
                      }
                    }
                  }
                }]
              }
            })
        }
    }
};


import { getAreaModel } from '../AreaSchema.js'
import { PointType } from '../AreaTypes.js'
interface CalculatedValues {
  density: number
  totalClimbs: number
  bounds: [PointType, PointType]
}
export const linkAreas = async (collectionName: string): Promise<void> => {
  try {
    const areasModel = getAreaModel(collectionName)

    for await (const area of areasModel.find()) {
      const pathHash = area.get('pathHash')
      const pathTokens = area.get('pathTokens')

      // find all areas whose parent = my pathHash (aka subareas)
      const subareas = await areasModel.find({ parentHashRef: pathHash })
      const climbs = await areasModel.find({ pathTokens: { $all: pathTokens } })

      if (climbs.length > 0) {
        const { density, bounds, totalClimbs } = getCalcuatedValues(climbs)
        area.set('bounds', bounds)
        area.set('density', density)
        area.set('totalClimbs', totalClimbs)
      }

      if (subareas.length > 0) {
        const refs = subareas.reduce((acc: string[], curr) => {
          acc.push(curr.get('_id'))
          return acc
        }, [])

        area.set('children', refs)
      }
      console.log('Saving id: ', area._id)
      await area.save()
    }
  } catch (e) {
    console.log(e)
  }
}

function getCalcuatedValues (climbs): CalculatedValues {
  const bounds: [PointType, PointType] = [
    { lat: Number.POSITIVE_INFINITY, lng: Number.POSITIVE_INFINITY },
    { lat: Number.NEGATIVE_INFINITY, lng: Number.NEGATIVE_INFINITY }]

  let totalClimbs = 0

  climbs.forEach(area => {
    if (area.metadata.lat !== null && area.metadata.lng !== null) {
      updateBounds(area.metadata.lat, area.metadata.lng, bounds)
    }

    // exit early if there are no climbs
    if (area.climbs === undefined) {
      return
    }

    area.climbs.forEach((climb) => {
      const { metadata: { lat, lng } } = climb

      if (lat !== null && lng !== null) {
        updateBounds(lat, lng, bounds)
      }

      totalClimbs += 1
    })
  })

  const density = getAreaDensity(bounds, totalClimbs)

  return {
    bounds,
    density,
    totalClimbs
  }
}

const getAreaDensity = (bounds: [PointType, PointType], totalClimbs: number): number => {
  const areaInKm = (bounds[1].lat - bounds[0].lat) * (bounds[1].lng - bounds[0].lng) * 111 * 111
  const minArea = areaInKm === 0 ? 5 : areaInKm
  return totalClimbs / minArea
}

const updateBounds = (lat: number, lng: number, bound: [PointType, PointType]): void => {
  // Bottom left of bounding box
  bound[0].lat = Math.min(bound[0].lat, lat)
  bound[0].lng = Math.min(bound[0].lng, lng)
  // Top Right of bounding box
  bound[1].lat = Math.max(bound[1].lat, lat)
  bound[1].lng = Math.max(bound[1].lng, lng)
}

export default linkAreas

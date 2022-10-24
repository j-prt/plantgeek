const plantData = require('../plantData2.json')
const { MongoClient, ObjectId } = require('mongodb')
const assert = require('assert')
require('dotenv').config()
const MONGO_URI = process.env.MONGO_URI

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

// (CREATE/POST) ADDS A NEW PLANT
const createPlant = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options)
  try {
    await client.connect()
    const db = client.db('plantgeekdb')
    // TODO: test with special characters
    const regex = new RegExp(req.body.primaryName, 'i') // "i" for case insensitive
    const existingPlant = await db.collection('plants').findOne({ primaryName: { $regex: regex } })
    if (existingPlant) {
      res.status(409).json({ status: 409, message: 'Plant already exists' })
    } else {
      const plant = await db.collection('plants').insertOne(req.body)
      res.status(201).json({ status: 201, plant: plant.ops[0] })
    }
  } catch (err) {
    res.status(500).json({ status: 500, data: req.body, message: err.message })
    console.error(err.stack)
  }
  client.close()
}

// (READ/GET) GETS ALL PLANTS
const getPlants = async (req, res) => {
  const { search, sort, toxic, review } = req.query
  let filters = {}

  if (search) {
    // for each string in search array, clean the string (remove special characters)
    const cleanedStrings = search.map(str => str.replace(/[^a-zA-Z ]/g, ''))
    // create a regex for each string in search array
    const regex = cleanedStrings.map(str => new RegExp(str, 'i'))
    filters = {
      ...filters,
      $or: [{ primaryName: { $in: regex } }, { secondaryName: { $in: regex } }],
    }
  }

  if (toxic === 'true') {
    filters = { ...filters, toxic: true }
  } else if (toxic === 'false') {
    filters = { ...filters, toxic: false }
  }

  if (review) {
    filters = {
      ...filters,
      review,
    }
  } else {
    filters = {
      ...filters,
      $and: [{ review: { $ne: 'pending' } }, { review: { $ne: 'rejected' } }],
    }
  }

  let order
  if (sort) {
    if (sort === 'name-asc') {
      order = { primaryName: 1 }
    } else if (sort === 'name-desc') {
      order = { primaryName: -1 }
    }
  }

  const client = await MongoClient(MONGO_URI, options)
  await client.connect()
  const db = client.db('plantgeekdb')

  try {
    // pagination
    const page = req.params.page ? parseInt(req.params.page) : 1
    const resultsPerPage = 24

    const plants = await db
      .collection('plants')
      .find(filters)
      .sort(order)
      .collation({ locale: 'en' })
      .skip(resultsPerPage * (page - 1))
      .limit(resultsPerPage)
      .toArray()

    const totalResults = await db.collection('plants').countDocuments(filters)

    if (plants) {
      res.status(200).json({
        plants: plants,
        page: page,
        totalResults,
        nextCursor: totalResults > 24 * page ? page + 1 : null,
      })
    } else {
      res.status(404).json({ status: 404, message: 'No plants found' })
    }
  } catch (err) {
    console.error(err)
  }

  client.close()
}

const getPlantsToReview = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options)
  await client.connect()
  const db = client.db('plantgeekdb')
  try {
    const plants = await db.collection('plants').find({ review: 'pending' }).toArray()
    if (plants) {
      res.status(200).json({ status: 200, plants: plants })
    } else {
      res.status(404).json({ status: 404, message: 'No plants found' })
    }
  } catch (err) {
    console.error(err)
  }
}

// (READ/GET) GETS PLANT BY ID
const getPlant = async (req, res) => {
  const id = req.params._id

  const client = await MongoClient(MONGO_URI, options)
  await client.connect()
  const db = client.db('plantgeekdb')

  try {
    const plant = await db.collection('plants').findOne({ _id: ObjectId(id) })
    if (plant) {
      res.status(200).json({ status: 200, plant: plant })
    } else {
      res.status(404).json({ status: 404, message: 'Plant not found' })
    }
  } catch (err) {
    console.error(err)
  }
  client.close()
}

const getSimilarPlants = async (req, res) => {
  const { plantId } = req.params

  const client = await MongoClient(MONGO_URI, options)
  await client.connect()
  const db = client.db('plantgeekdb')

  try {
    const plant = await db.collection('plants').findOne({ _id: ObjectId(plantId) })
    if (plant) {
      // take words from plant's primary name and secondary name
      const words = plant.primaryName.split(' ').concat(plant.secondaryName.split(' '))
      // clean the words (remove special characters)
      const cleanedWords = words.map(word => word.replace(/[^a-zA-Z ]/g, ''))
      // for each word, create a regex and search for similar plants
      const regex = cleanedWords.map(str => new RegExp(str, 'i'))
      let filters = {
        // not this plant
        _id: { $ne: ObjectId(plantId) },
        $or: [{ primaryName: { $in: regex } }, { secondaryName: { $in: regex } }],
      }

      const similarPlants = await db.collection('plants').find(filters).limit(6).toArray()

      res.status(200).json({ status: 200, similarPlants: similarPlants })
    } else {
      res.status(404).json({ status: 404, message: 'Plant not found' })
    }
  } catch (err) {
    console.error(err)
  }
  client.close()
}

const getRandomPlants = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options)
  await client.connect()
  const db = client.db('plantgeekdb')
  try {
    const plants = await db
      .collection('plants')
      .aggregate([{ $sample: { size: 12 } }])
      .toArray()
    if (plants) {
      res.status(200).json({ status: 200, plants: plants })
    } else {
      res.status(404).json({ status: 404, message: 'No plants found' })
    }
  } catch (err) {
    console.error(err)
  }
  client.close()
}

const getUserPlants = async (req, res) => {
  const { ids } = req.query
  const client = await MongoClient(MONGO_URI, options)
  await client.connect()
  const db = client.db('plantgeekdb')
  try {
    if (ids && ids.length > 0) {
      const objectIds = ids.map(id => ObjectId(id))
      const plants = await db
        .collection('plants')
        .find({ _id: { $in: objectIds } })
        .toArray()
      if (plants) {
        res.status(200).json({ status: 200, plants: plants })
      } else {
        res.status(404).json({ status: 404, message: 'No plants found' })
      }
    } else {
      console.log('no ids')
      res.status(404).json({ status: 404, message: 'No plants in list' })
    }
  } catch (err) {
    console.error(err)
  }
  client.close()
}

const getUserContributions = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options)
  await client.connect()
  const db = client.db('plantgeekdb')
  try {
    const contributions = await db
      .collection('plants')
      .find({ contributorId: req.params.userId })
      .toArray()
    if (contributions) {
      res.status(200).json({ status: 200, contributions: contributions })
    } else {
      res.status(404).json({ status: 404, message: 'No contributions found' })
    }
  } catch (err) {
    console.error(err)
  }
}

// (UPDATE/PUT) ADDS COMMENT TO A PLANT BY ID
const addComment = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options)
  const _id = req.params._id
  try {
    await client.connect()
    const db = client.db('plantgeekdb')
    const plants = db.collection('plants')
    const filter = { _id: ObjectId(_id) }
    let update = undefined
    if (req.body.comments) {
      update = {
        $push: {
          comments: req.body.comments,
        },
      }
    }
    const result = await plants.updateOne(filter, update)
    res.status(200).json({
      status: 200,
      message: `${result.matchedCount} plant(s) matched the filter, updated ${result.modifiedCount} plant(s)`,
    })
  } catch (err) {
    res.status(404).json({ status: 404, message: err.message })
    console.error(err.stack)
  }
  client.close()
}

const updatePlant = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options)
  const _id = req.params._id
  try {
    await client.connect()
    const db = client.db('plantgeekdb')
    const filter = { _id: ObjectId(_id) }
    const update = {
      $set: req.body,
    }
    const result = await db.collection('plants').updateOne(filter, update)
    res.status(200).json({ status: 200, data: result })
  } catch (err) {
    res.status(500).json({ status: 500, data: req.body, message: err.message })
    console.error(err)
  }
  client.close()
}

// TODO: will need to remove from users' lists or add a check in case plant data is missing
const deletePlant = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options)
  const _id = req.params._id
  await client.connect()
  const db = client.db('plantgeekdb')
  try {
    const filter = { _id: ObjectId(_id) }
    const result = await db.collection('plants').deleteOne(filter)
    res.status(200).json({ status: 200, data: result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 500, data: req.body, message: err.message })
  }
  client.close()
}

// taking all plants and saving images to cloudinary, then updating the plant with the cloudinary image url
const uploadToCloudinary = async () => {
  const client = await MongoClient(MONGO_URI, options)
  await client.connect()
  const db = client.db('plantgeekdb')

  try {
    // finding plants where imageUrl includes 'shopify'
    const plants = await db
      .collection('plants')
      .find({ imageUrl: { $regex: 'shopify' } })
      .toArray()

    if (plants) {
      const cloudinary = require('cloudinary').v2
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET,
      })

      let plantsUpdated = 0
      const promises = plants.map(async plant => {
        try {
          const url = `https://${plant.imageUrl}`
          const res = await cloudinary.uploader.upload(url, {
            folder: 'plantgeek-plants',
          })
          // updating plant with new image url
          const filter = { _id: ObjectId(plant._id) }
          const update = {
            $set: {
              imageUrl: res.secure_url,
            },
          }
          await db.collection('plants').updateOne(filter, update)
          plantsUpdated++
        } catch (err) {
          console.error('error uploading to cloudinary', err)
        }
      })
      await Promise.all(promises)
      console.log('done with image upload', 'plants updated: ', plantsUpdated)
    } else {
      console.log('no plants found with shopify image url')
    }
  } catch (err) {
    console.error('error with image upload', err)
  }
  client.close()
}

const importPlantData = async () => {
  // for each plant in json file, check if plant already exists in db by primaryName and secondaryName

  const cloudinary = require('cloudinary').v2
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  })

  const client = await MongoClient(MONGO_URI, options)
  await client.connect()
  const db = client.db('plantgeekdb')

  try {
    const plants = await db.collection('plants').find().toArray()
    let existingPlants = 0
    let newPlants = 0
    const promises = plantData.map(async plant => {
      const plantExists = plants.find(
        p =>
          p.primaryName.toLowerCase() === plant.primaryName.toLowerCase() ||
          p.secondaryName.toLowerCase() === plant.secondaryName.toLowerCase() ||
          p.primaryName.toLowerCase() === plant.secondaryName.toLowerCase() ||
          p.secondaryName.toLowerCase() === plant.primaryName.toLowerCase()
      )
      // if it's new, upload image by imageUrl to cloudinary and change the imageUrl to the cloudinary url
      if (!plantExists) {
        try {
          const url = plant.imageUrl
          const result = await cloudinary.uploader.upload(url, {
            folder: 'plantgeek-plants',
          })
          plant.imageUrl = result.secure_url
        } catch (err) {
          console.error('Error uploading image to cloudinary', err)
        }
        // add plant to db
        await db.collection('plants').insertOne(plant)
        console.log('plant imported', plant.primaryName)
        newPlants++
      } else {
        console.log('plant already exists', plant.primaryName)
        existingPlants++
      }
    })
    await Promise.all(promises)
    console.log('done', `existing plants: ${existingPlants}`, `new plants: ${newPlants}`)
  } catch (err) {
    console.error('Error importing plant data', err)
  }
}

const getSearchTerms = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options)
  await client.connect()
  const db = client.db('plantgeekdb')

  // TODO: update this function to clean up search terms for regular users
  try {
    // get all unique words from plant names in db
    const plants = await db.collection('plants').find().toArray()
    const words = plants
      .map(plant => {
        const primaryName = plant.primaryName.split(' ')
        const secondaryName = plant.secondaryName.split(' ')
        return [...primaryName, ...secondaryName]
      })
      // remove short words or words with special characters
      .flat()
    // .filter(
    //   word => word.length > 2 && !word.includes("'") && !word.includes('(') && !word.includes(')')
    // )

    // count and set the number of times each word appears
    // const wordCounts = {}
    // words.forEach(word => {
    //   if (wordCounts[word]) {
    //     wordCounts[word]++
    //   } else wordCounts[word] = 1
    // })

    // remove duplicates
    const uniqueWords = [...new Set(words)]
    // sort words alphabetically
    const sortedWords = uniqueWords.sort((a, b) => a.localeCompare(b))

    // sort words by order of frequency from most to least
    // const sortedWords = Object.keys(wordCounts)
    //   .sort((a, b) => {
    //     return wordCounts[b] - wordCounts[a]
    //   })
    //   .filter(
    //     // remove words with less than 4 occurrences
    //     word => wordCounts[word] > 3
    //   )
    //   .map(word => word.toLowerCase())

    res.status(200).json({ status: 200, data: sortedWords, totalResults: sortedWords.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 500, data: req.body, message: err.message })
  }
}

module.exports = {
  createPlant,
  getPlants,
  getPlantsToReview,
  getPlant,
  getSimilarPlants,
  getRandomPlants,
  getUserPlants,
  getUserContributions,
  addComment,
  updatePlant,
  deletePlant,
  getSearchTerms,
}

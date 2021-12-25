import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { plantsArray } from '../reducers/plantReducer.js'

import styled from 'styled-components/macro'
import { BeatingHeart } from './loaders/BeatingHeart'
import { FadeIn } from './loaders/FadeIn.js'
import { RiArrowRightSFill } from 'react-icons/ri'

import { PlantCard } from './PlantCard'

export const FeaturedPlants = () => {
  const plants = useSelector(plantsArray)
  const [featuredPlants, setFeaturedPlants] = useState(undefined)

  // SETS FEATURED PLANTS (random plants change each time you load)
  useEffect(() => {
    const getRandomPlant = () => {
      const randomIndex = Math.floor(Math.random() * plants.length)
      const randomPlant = plants[randomIndex]
      return randomPlant
    }
    // only run function if there are more than 6 plants in db
    let tempArray = plants.length > 6 ? [] : undefined
    if (tempArray) {
      while (tempArray.length < 6) {
        let randomPlant = getRandomPlant(plants)
        if (!tempArray.find((plant) => plant.species === randomPlant.species)) {
          tempArray.push(randomPlant)
        }
      }
      setFeaturedPlants(tempArray)
    } else {
      setFeaturedPlants(plants)
    }
  }, [plants])

  return (
    <Wrapper>
      {featuredPlants && featuredPlants.length > 0 ? (
        <FadeIn>
          <Heading>featured houseplants</Heading>
          <Plants>
            {featuredPlants.map((plant) => {
              return <PlantCard key={plant._id} plant={plant} />
            })}
          </Plants>
          <Link to='/browse'>
            <BrowseLink>
              browse more <RiArrowRightSFill />
            </BrowseLink>
          </Link>
        </FadeIn>
      ) : (
        <BeatingHeart />
      )}
    </Wrapper>
  )
}

const Wrapper = styled.section`
  background: #f2f2f2;
  padding: 30px;
  display: grid;
  place-content: center;
`

const Heading = styled.h2`
  text-align: center;
`

const BrowseLink = styled.h3`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`

const Plants = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 0 50px;
  max-width: 900px;
`

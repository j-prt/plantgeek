import React, { useState, useEffect, useContext } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { UserContext } from '../contexts/UserContext'
import axios from 'axios'

import styled from 'styled-components/macro'
import { COLORS, BREAKPOINTS } from '../GlobalStyles'
import { BeatingHeart } from '../components/loaders/BeatingHeart'
import { FadeIn } from '../components/loaders/FadeIn.js'
import { ImageLoader } from '../components/loaders/ImageLoader'
import placeholder from '../assets/plant-placeholder.svg'
import { Button } from 'antd'
import { LeftCircleFilled } from '@ant-design/icons'
import sun from '../assets/sun.svg'
import water from '../assets/water.svg'
import temp from '../assets/temp.svg'
import humidity from '../assets/humidity.svg'

import { ActionBox } from '../components/ActionBox'

export const PlantProfile = () => {
  const { id } = useParams()
  const { history, goBack } = useHistory()
  const { currentUser } = useContext(UserContext)
  const [difficulty, setDifficulty] = useState()

  const { data: plant } = useQuery('plant', async () => {
    const { data } = await axios.get(`/plant/${id}`)
    return data.plant
  })

  // makes window scroll to top between renders
  useEffect(() => {
    window.scrollTo(0, 0)
  })

  // setting plant care difficulty
  useEffect(() => {
    if (plant && plant.light && plant.water && plant.temperature && plant.humidity) {
      let lightLevel = 0
      let waterLevel = 0
      let temperatureLevel = 0
      let humidityLevel = 0
      if (plant.light === 'low to bright indirect') {
        lightLevel = 0
      } else if (plant.light === 'medium indirect') {
        lightLevel = 1
      } else if (plant.light === 'medium to bright indirect') {
        lightLevel = 2
      } else if (plant.light === 'bright indirect') {
        lightLevel = 3
      } else if (plant.light === 'bright') {
        lightLevel = 4
      }
      if (plant.water === 'low') {
        waterLevel = 0
      } else if (plant.water === 'low to medium') {
        waterLevel = 1
      } else if (plant.water === 'medium') {
        waterLevel = 2
      } else if (plant.water === 'medium to high') {
        waterLevel = 3
      } else if (plant.water === 'high') {
        waterLevel = 4
      }
      if (plant.temperature === 'average') {
        temperatureLevel = 0
      } else if (plant.temperature === 'warm') {
        temperatureLevel = 2
      }
      if (plant.humidity === 'average') {
        humidityLevel = 0
      } else if (plant.humidity === 'high') {
        humidityLevel = 2
      }
      let total = lightLevel + waterLevel + temperatureLevel + humidityLevel
      // lowest = 0
      // highest = 12
      if (total <= 3) {
        setDifficulty('Easy')
      } else if (total <= 6) {
        setDifficulty('Moderate')
      } else if (total <= 12) {
        setDifficulty('Hard')
      }
    }
  }, [plant])

  // DELETE PLANT (ADMINS ONLY)
  const deletePlant = () => {
    window.confirm(
      'Are you sure you want to delete this plant from the database? This cannot be undone!'
    )
    axios
      .delete(`/plants/${plant._id}`)
      .then
      // TODO: invalidate plant queries?
      ()
      .then(history.push('/browse'))
      .catch(err => console.log(err))
  }

  return (
    <Wrapper>
      {plant ? (
        <>
          <FadeIn>
            <section className='heading'>
              <div className='back'>
                <Button type='link' icon={<LeftCircleFilled />} onClick={goBack}>
                  Back
                </Button>
              </div>
              <h1>{plant?.primaryName?.toLowerCase()}</h1>
              <div className='secondary-name-wrapper'>
                <b className='aka'>Also known as: </b>
                <span className='secondary-name'>
                  {plant?.secondaryName ? plant?.secondaryName : 'N/A'}
                </span>
              </div>
              {/* TODO: keep this subtle, style as tags */}
              {/* {plant?.toxic ? (
                <span className='toxic'>
                  <img src={skull} alt='' />
                  Toxic
                </span>
              ) : (
                <span className='nontoxic'>
                  <FaPaw />
                  Nontoxic
                </span>
              )} */}
            </section>
          </FadeIn>
          <FadeIn>
            <section className='plant-info'>
              <div className='primary-image'>
                <ImageLoader src={plant?.imageUrl} alt={''} placeholder={placeholder} />
              </div>
              <Needs>
                <h2>
                  care information
                  <p className='difficulty'>Difficulty: {difficulty}</p>
                </h2>
                <div className='row'>
                  <img src={sun} alt='' />
                  <div className='column'>
                    <p>{plant.light} light</p>
                    <Bar>
                      {plant.light === 'low to bright indirect' && <Indicator level={'1'} />}
                      {plant.light === 'medium indirect' && <Indicator level={'1-2'} />}
                      {plant.light === 'medium to bright indirect' && <Indicator level={'2'} />}
                      {plant.light === 'bright indirect' && <Indicator level={'2-3'} />}
                      {plant.light === 'bright' && <Indicator level={'3'} />}
                    </Bar>
                  </div>
                </div>
                <div className='row'>
                  <img src={water} alt='' />
                  <div className='column'>
                    <p>{plant.water} water</p>
                    <Bar>
                      {plant.water === 'low' && <Indicator level={'1'} />}
                      {plant.water === 'low to medium' && <Indicator level={'1-2'} />}
                      {plant.water === 'medium' && <Indicator level={'2'} />}
                      {plant.water === 'medium to high' && <Indicator level={'2-3'} />}
                      {plant.water === 'high' && <Indicator level={'3'} />}
                    </Bar>
                  </div>
                </div>
                <div className='row'>
                  <img src={temp} alt='' />
                  <div className='column'>
                    <p>{plant.temperature} temperature</p>
                    <Bar>
                      {plant.temperature === 'average' && <Indicator level={'1-2'} />}
                      {plant.temperature === 'warm' && <Indicator level={'3'} />}
                    </Bar>
                  </div>
                </div>
                <div className='row'>
                  <img src={humidity} alt='' />
                  <div className='column'>
                    <p>{plant.humidity} humidity</p>
                    <Bar>
                      {plant.humidity === 'average' && <Indicator level={'1-2'} />}
                      {plant.humidity === 'high' && <Indicator level={'3'} />}
                    </Bar>
                  </div>
                </div>
                {plant.sourceUrl && (
                  <p className='sources'>
                    Source(s):{' '}
                    <a href={plant.sourceUrl} target='_blank' rel='noopenner noreferrer'>
                      [1]
                    </a>
                  </p>
                )}
              </Needs>
            </section>
          </FadeIn>
          {currentUser && (
            <FadeIn>
              <ActionBox id={plant._id} />
            </FadeIn>
          )}

          {currentUser?.role === 'admin' && (
            <DangerZone>
              <p>DANGER ZONE</p>
              <Button type='danger' onClick={deletePlant}>
                DELETE PLANT
              </Button>
            </DangerZone>
          )}

          {/* TODO: gallery section */}
          {/* <FadeIn>
            <section className='gallery'>
              <h2>gallery</h2>
              {plant?.gallery?.length > 0
                ? plant.gallery.map(image => <img className='gallery-image' src={image} alt='' />)
                : 'This plant has no additional images yet. Upload new images of this plant to add to our gallery!'}
            </section>
          </FadeIn> */}

          {/* TODO: similar plants section (genus) */}
          {/* <FadeIn>
            <section className='similar-plants'>
              <h2>similar plants</h2>
            </section>
          </FadeIn> */}

          {/* TODO: wip */}
          {/* {currentUser && (
            <FadeIn>
              <UpdatePlant currentUser={currentUser} plant={plant} />
            </FadeIn>
          )} */}
        </>
      ) : (
        <BeatingHeart />
      )}
    </Wrapper>
  )
}

const Wrapper = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  .heading {
    background: ${COLORS.light};
    .ant-btn-link {
      color: #fff;
      padding: 0;
      margin: 0;
      border: 0;
      margin-bottom: 10px;
    }
    h1 {
      line-height: 1;
      font-size: 1.5rem;
      margin-bottom: 10px;
    }
    .secondary-name-wrapper {
      font-size: 0.8rem;
    }
  }
  .plant-info {
    background: #fff;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    .primary-image {
      display: flex;
      justify-content: center;
      flex: 1;
      img {
        margin: auto;
        width: 100%;
        border-radius: 50%;
        &.placeholder {
          border-radius: 0;
        }
        @media only screen and (min-width: ${BREAKPOINTS.tablet}) {
          width: 400px;
          &.placeholder {
            width: 300px;
          }
        }
      }
    }
  }
  @media only screen and (min-width: ${BREAKPOINTS.tablet}) {
    .heading {
      text-align: right;
      h1 {
        font-size: 2rem;
      }
      .secondary-name-wrapper {
        font-size: 1rem;
      }
    }
  }
  @media only screen and (min-width: 1200px) {
    .plant-info {
      flex-direction: row;
    }
  }
`

const Needs = styled.div`
  background: #f2f2f2;
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  padding: 20px 30px;
  border-radius: 20px;
  flex: 1;
  h2 {
    font-size: 1.2rem;
    .difficulty {
      color: #999;
      font-size: 0.9rem;
    }
  }
  .row {
    display: flex;
    align-items: center;
    margin: 10px 0;
    img {
      background: #fff;
      padding: 5px;
      border-radius: 50%;
      height: 40px;
      margin-right: 10px;
    }
    .column {
      flex: 1;
      p {
        font-size: 0.8rem;
      }
    }
  }
  .sources {
    color: #999;
    font-size: 0.8rem;
    margin: 10px 0;
  }
  @media only screen and (min-width: ${BREAKPOINTS.tablet}) {
    .row {
      img {
        height: 45px;
        margin-right: 15px;
      }
      .column {
        p {
          font-size: 1rem;
        }
      }
    }
  }
  @media only screen and (min-width: 1200px) {
    margin-top: 0;
  }
`

const Bar = styled.div`
  background: white;
  height: 15px;
  border-radius: 10px;
  margin: 5px 0;
  @media only screen and (min-width: ${BREAKPOINTS.tablet}) {
    height: 20px;
  }
`

const Indicator = styled.div`
  background: linear-gradient(to right, ${COLORS.lightest}, ${COLORS.light});
  height: 100%;
  border-radius: 10px;
  width: ${props => props.level === '1' && '25%'};
  width: ${props => props.level === '1-2' && '50%'};
  width: ${props => props.level === '1-3' && '100%'};
  width: ${props => props.level === '2' && '50%'};
  width: ${props => props.level === '2-3' && '75%'};
  width: ${props => props.level === '3' && '100%'};
`

const DangerZone = styled.div`
  background: #fff;
  width: 100%;
  margin: 30px 0;
  border: 1px dotted red;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  p {
    color: red;
  }
`

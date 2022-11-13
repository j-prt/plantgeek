import { useState, useEffect, useContext } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { API_URL } from '../constants'
import { message, Modal, Alert, Button, Drawer } from 'antd'
import moment from 'moment'
import { Formik, Form } from 'formik'
import { FormItem } from '../components/forms/FormItem'
import { Input, Select } from 'formik-antd'
import * as Yup from 'yup'
import { UserContext } from '../contexts/UserContext'
import axios from 'axios'
import styled from 'styled-components/macro'
import { COLORS, BREAKPOINTS } from '../GlobalStyles'
import {
  EditOutlined,
  ClockCircleOutlined,
  LikeOutlined,
  DislikeOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { BiLogInCircle } from 'react-icons/bi'
import { MdOutlineAdminPanelSettings } from 'react-icons/md'
import { BeatingHeart } from '../components/loaders/BeatingHeart'
import { FadeIn } from '../components/loaders/FadeIn.js'
import { ImageLoader } from '../components/loaders/ImageLoader'
import placeholder from '../assets/plant-placeholder.svg'
import { MailOutlined } from '@ant-design/icons'
import sun from '../assets/sun.svg'
import water from '../assets/water.svg'
import temp from '../assets/temp.svg'
import humidity from '../assets/humidity.svg'
import { ActionBox } from '../components/ActionBox'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { PlantCard } from '../components/PlantCard'
import { Ellipsis } from '../components/loaders/Ellipsis'
import { PlantEditor } from '../components/PlantEditor'
const { Option } = Select

export const PlantProfile = () => {
  const { slug } = useParams()
  const history = useHistory()
  const queryClient = new useQueryClient()
  const { currentUser } = useContext(UserContext)
  const [difficulty, setDifficulty] = useState()
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const { data: plant, status } = useQuery(['plant', slug], async () => {
    try {
      const { data } = await axios.get(`${API_URL}/plant/${slug}`)
      return data.plant
    } catch (err) {
      if (err.response.status === 404) return null
    }
  })

  const { data: suggestions } = useQuery(['suggestions', slug], async () => {
    const { data } = await axios.get(`${API_URL}/suggestions/${slug}`)
    return data.suggestions
  })

  const { data: similarPlants, status: similarPlantsStatus } = useQuery(
    ['similar-plants', slug],
    async () => {
      const { data } = await axios.get(`${API_URL}/similar-plants/${slug}`)
      return data.similarPlants
    }
  )

  useDocumentTitle(plant?.primaryName ? `${plant?.primaryName} • plantgeek` : 'plantgeek')

  // setting plant care difficulty
  useEffect(() => {
    if (plant && plant.light && plant.water && plant.temperature && plant.humidity) {
      let lightLevel = 0
      let waterLevel = 0
      let temperatureLevel = 0
      let humidityLevel = 0
      if (plant.light === 'low to bright indirect') {
        lightLevel = 0
      } else if (plant.light === 'medium to bright indirect') {
        lightLevel = 1
      } else if (plant.light === 'bright indirect') {
        lightLevel = 3
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
      } else if (plant.temperature === 'above average') {
        temperatureLevel = 2
      }
      if (plant.humidity === 'low') {
        humidityLevel = 1
      } else if (plant.humidity === 'medium') {
        humidityLevel = 2
      } else if (plant.humidity === 'high') {
        humidityLevel = 3
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

  // DELETE PLANT (ADMIN)
  const handleDelete = plantId => {
    history.push('/browse')
    axios.delete(`${API_URL}/plants/${plantId}`).catch(err => console.log(err))
  }

  return (
    <Wrapper>
      {status === 'success' ? (
        plant ? (
          <>
            <FadeIn>
              <section className='heading'>
                {plant.review === 'pending' && (
                  <div className='review-pending'>
                    <Alert
                      type='warning'
                      message='This plant is pending review by an admin.'
                      showIcon
                    />
                  </div>
                )}
                {plant.review === 'rejected' && (
                  <div className='review-pending'>
                    <Alert
                      type='error'
                      message='This plant has been rejected by an admin. The information may be incorrect or is a duplicate.'
                      showIcon
                    />
                  </div>
                )}
                <h1>{plant.primaryName?.toLowerCase()}</h1>
                <p className='secondary-name'>{plant.secondaryName.toLowerCase()}</p>
              </section>
            </FadeIn>

            <FadeIn delay={200}>
              <section className='plant-info'>
                <div className='primary-image'>
                  <ImageLoader
                    src={plant.imageUrl}
                    alt=''
                    placeholder={placeholder}
                    borderRadius='10px'
                  />
                  {/* TODO: gallery here */}
                </div>

                {/* PLANT NEEDS */}
                <Info>
                  <div className='needs'>
                    <div className='row'>
                      <img src={sun} alt='' />
                      <div className='column'>
                        <p>{plant.light || 'unknown'}</p>

                        <Bar>
                          {plant.light === 'low to bright indirect' && <Indicator level={'1'} />}
                          {plant.light === 'medium to bright indirect' && <Indicator level={'2'} />}
                          {plant.light === 'bright indirect' && <Indicator level={'3'} />}
                        </Bar>
                      </div>
                    </div>
                    <div className='row'>
                      <img src={water} alt='' />
                      <div className='column'>
                        <p>{plant.water || 'unknown'}</p>
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
                        <p>
                          {plant.temperature === 'average'
                            ? 'average (55-75°F)'
                            : plant.temperature === 'above average'
                            ? 'above average (65-85°F)'
                            : plant.temperature || 'unknown'}
                        </p>

                        <Bar>
                          {plant.temperature === 'average' && <Indicator level={'1-2'} />}
                          {plant.temperature === 'above average' && <Indicator level={'3'} />}
                        </Bar>
                      </div>
                    </div>
                    <div className='row'>
                      <img src={humidity} alt='' />
                      <div className='column'>
                        <p>
                          {plant.humidity === 'low'
                            ? 'low (30-40%)'
                            : plant.humidity === 'medium'
                            ? 'medium (40-50%)'
                            : plant.humidity === 'high'
                            ? 'high (50-60%+)'
                            : plant.humidity || 'unknown'}
                        </p>

                        <Bar>
                          {plant.humidity === 'low' && <Indicator level={'1'} />}
                          {plant.humidity === 'medium' && <Indicator level={'2'} />}
                          {plant.humidity === 'high' && <Indicator level={'3'} />}
                        </Bar>
                      </div>
                    </div>
                  </div>
                  <div className='misc-info'>
                    <div className={`difficulty ${difficulty?.toLowerCase()}`}>
                      Difficulty: {difficulty || 'N/A'}
                    </div>
                    <div
                      className={`toxicity ${
                        plant.toxic === true
                          ? 'toxic'
                          : plant.toxic === false
                          ? 'nontoxic'
                          : 'unkown'
                      }`}>
                      {plant.toxic === true
                        ? 'Toxic'
                        : plant.toxic === false
                        ? 'Non-toxic'
                        : 'Toxicity unknown'}
                    </div>
                  </div>
                  <div className='links'>
                    <Link to='/guidelines' className='link'>
                      Care Tips
                    </Link>
                    •
                    <a
                      className='source-link'
                      href={plant.sourceUrl}
                      target='_blank'
                      rel='noopenner noreferrer'>
                      Source
                    </a>
                  </div>
                </Info>
              </section>
            </FadeIn>

            <FadeIn delay={400}>
              <div className='actions'>
                {/* COLLECTION / WISHLIST / HEARTS */}
                {plant.review !== 'pending' && plant.review !== 'rejected' && (
                  <ActionBox plant={plant} />
                )}

                {/* SUGGESTION SUBMISSION */}
                <section className='suggestions-section-user'>
                  <h3>Have a suggestion?</h3>
                  <p>
                    Please let us know if you have a suggestion for this plant or want to report
                    incorrect information.
                  </p>
                  <Button type='primary' onClick={() => setSuggestionModalOpen(true)}>
                    <MailOutlined /> SEND SUGGESTION
                  </Button>
                  <Modal
                    visible={suggestionModalOpen}
                    footer={null}
                    onCancel={() => setSuggestionModalOpen(false)}>
                    <SuggestionSubmission>
                      {currentUser ? (
                        <Formik
                          initialValues={{
                            suggestion: '',
                            sourceUrl: '',
                          }}
                          validationSchema={Yup.object({
                            suggestion: Yup.string().required('Required'),
                            sourceUrl: Yup.string().url('Invalid URL'),
                          })}
                          onSubmit={async (values, { setSubmitting }) => {
                            if (currentUser.emailVerified) {
                              try {
                                await axios.post(`${API_URL}/suggestions/${plant._id}`, {
                                  suggestion: values.suggestion,
                                  sourceUrl: values.sourceUrl,
                                  userId: currentUser._id,
                                })
                                message.success('Suggestion submitted')
                                setSuggestionModalOpen(false)
                              } catch (err) {
                                console.log(err)
                                message.error('Oops, something went wrong')
                              }
                            }
                          }}>
                          {({ isSubmitting, submitForm }) => (
                            <Form>
                              <h3>Submit a suggestion</h3>
                              <div className='instructions'>
                                <p>
                                  Please note any incorrect information on this plant and include
                                  your suggested change. If possible, include a source to help us
                                  validate your information.
                                </p>
                                <p>
                                  We also welcome suggestions for additional information to add to
                                  this plant's page. Thank you for your contribution!
                                </p>
                              </div>

                              <FormItem name='suggestion'>
                                <Input.TextArea
                                  name='suggestion'
                                  placeholder='Enter your suggestion'
                                  rows={4}
                                  style={{ resize: 'none' }}
                                />
                              </FormItem>
                              <FormItem name='source'>
                                <Input name='sourceUrl' placeholder='Source URL' />
                              </FormItem>
                              {!currentUser.emailVerified && (
                                <Alert
                                  type='warning'
                                  message='Please verify your email address to submit a suggestion.'
                                  showIcon
                                />
                              )}
                              <Button
                                type='primary'
                                disabled={isSubmitting || !currentUser.emailVerified}
                                loading={isSubmitting}
                                onClick={submitForm}>
                                SUBMIT
                              </Button>
                            </Form>
                          )}
                        </Formik>
                      ) : (
                        // TODO: add redirect to return user here after they log in
                        <div className='login'>
                          <p>Please log in to submit a suggestion.</p>
                          <Link to='/login'>
                            <Button type='primary'>
                              <BiLogInCircle /> LOG IN
                            </Button>
                          </Link>
                        </div>
                      )}
                    </SuggestionSubmission>
                  </Modal>
                </section>
              </div>
            </FadeIn>

            {/* SIMILAR PLANTS */}
            <FadeIn delay={600}>
              <section className='similar-plants'>
                <h2>similar plants</h2>
                {/* TODO: carousel (1 at a time on mobile, 2 on tablet, 3 on desktop) */}
                <div className='similar-plants-container'>
                  {similarPlantsStatus === 'success' ? (
                    similarPlants?.length > 0 ? (
                      similarPlants.map(plant => <PlantCard key={plant._id} plant={plant} />)
                    ) : (
                      <p>No similar plants found.</p>
                    )
                  ) : (
                    <div className='loading'>
                      <Ellipsis />
                    </div>
                  )}
                </div>
              </section>
            </FadeIn>

            {/* ADMIN ONLY */}
            {currentUser?.role === 'admin' && (
              <FadeIn delay={700}>
                <AdminSection>
                  <h3>
                    <MdOutlineAdminPanelSettings /> Admin
                  </h3>

                  <div className='suggestions-admin'>
                    <h4>Suggestions from users</h4>
                    {/* TODO: filter suggestions by status */}
                    <div className='suggestions-list'>
                      {suggestions?.length > 0 ? (
                        suggestions.map((suggestion, i) => (
                          <div className='suggestion' key={i}>
                            <p className='user'>
                              {suggestion.user?.username}{' '}
                              <span className='id'>- User ID {suggestion.userId}</span>
                            </p>
                            <p className='date'>{moment(suggestion.dateSubmitted).format('lll')}</p>
                            <p className='text'>"{suggestion.suggestion}"</p>
                            {suggestion.sourceUrl ? (
                              <a
                                className='source'
                                href={suggestion.sourceUrl}
                                target='_blank'
                                rel='noopener noreferrer'>
                                Source
                              </a>
                            ) : (
                              <p style={{ color: '#999' }}>No source.</p>
                            )}
                            <Formik
                              initialValues={{ status: suggestion.status }}
                              onSubmit={async (values, { setSubmitting }) => {
                                try {
                                  await axios.put(`${API_URL}/suggestions/${suggestion._id}`, {
                                    status: values.status,
                                  })
                                  message.success('Suggestion status updated')
                                  setSubmitting(false)
                                } catch (err) {
                                  console.log(err)
                                  message.error('Oops, something went wrong')
                                }
                              }}>
                              {({ submitForm }) => (
                                <Form>
                                  <FormItem name='status'>
                                    <Select
                                      name='status'
                                      placeholder='Set status'
                                      onChange={() => submitForm()}>
                                      <Option value='pending'>
                                        <ClockCircleOutlined /> Pending
                                      </Option>
                                      <Option value='approved'>
                                        <LikeOutlined /> Approved
                                      </Option>
                                      <Option value='rejected'>
                                        <DislikeOutlined /> Rejected
                                      </Option>
                                    </Select>
                                  </FormItem>
                                </Form>
                              )}
                            </Formik>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: '#999' }}>No suggestions.</p>
                      )}
                    </div>
                  </div>

                  <div className='admin-buttons'>
                    <Button
                      type='primary'
                      icon={<EditOutlined />}
                      onClick={() => setEditDrawerOpen(true)}>
                      EDIT PLANT
                    </Button>
                    <Drawer
                      title='Edit plant'
                      visible={editDrawerOpen}
                      onClose={() => setEditDrawerOpen(false)}>
                      <PlantEditor
                        plant={plant}
                        slug={slug}
                        currentUser={currentUser}
                        setEditDrawerOpen={setEditDrawerOpen}
                      />
                    </Drawer>

                    <Button type='danger' onClick={() => setDeleteModalOpen(true)}>
                      DELETE PLANT...
                    </Button>
                    <Modal
                      title='Delete plant'
                      visible={deleteModalOpen}
                      footer={false}
                      onCancel={() => setDeleteModalOpen(false)}>
                      <p>
                        Are you sure you want to permanently delete <b>{plant.primaryName}</b>?
                      </p>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <Button
                          type='danger'
                          onClick={() => handleDelete(plant._id)}
                          icon={<DeleteOutlined />}>
                          DELETE
                        </Button>
                        <Button type='secondary' onClick={() => setDeleteModalOpen(false)}>
                          CANCEL
                        </Button>
                      </div>
                    </Modal>
                  </div>
                </AdminSection>
              </FadeIn>
            )}
          </>
        ) : (
          <section className='not-found'>
            <img src={placeholder} alt='' />
            <p>Plant not found.</p>
            <Link to='/'>
              <Button type='primary'>Go Home</Button>
            </Link>
          </section>
        )
      ) : (
        <section className='loading'>
          <BeatingHeart />
        </section>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.main`
  form {
    width: 100%;
    .basic-info-form {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 400px;
    }
  }
  .heading {
    background: ${COLORS.light};
    .review-pending {
      margin-bottom: 20px;
    }
    h1 {
      line-height: 1;
      font-size: 1.5rem;
      margin-bottom: 10px;
    }
    .secondary-name {
      font-size: 1rem;
      font-style: italic;
    }
    .buttons {
      display: flex;
      gap: 10px;
    }
    button {
      margin-top: 20px;
    }
  }
  .plant-info {
    background: #fff;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    .upload-wrapper {
      flex: 1;
      width: 100%;
      max-width: 400px;
      text-align: center;
      button {
        margin-top: 20px;
      }
    }
    .primary-image {
      display: flex;
      flex: 1;
      width: 100%;
      max-width: 400px;
      aspect-ratio: 1 / 1;
      margin: auto;
      position: relative;
      img {
        object-fit: cover;
        width: 100%;
        border-radius: 10px;
        aspect-ratio: 1 / 1;
        &.placeholder {
          border-radius: 0;
          width: 80%;
          object-fit: contain;
        }
      }
    }
  }
  .actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .suggestions-section-user {
    background: ${COLORS.mutedMedium};
    button {
      margin-top: 20px;
    }
  }
  .similar-plants {
    background: #f2f2f2;
    h2 {
      text-align: center;
      margin-bottom: 30px;
    }
    .similar-plants-container {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 20px;
    }
  }
  .loading,
  .not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
  }
  .not-found {
    background: #fff;
    gap: 20px;
    img {
      height: 100px;
    }
  }
  @media only screen and (min-width: ${BREAKPOINTS.tablet}) {
    .heading {
      h1 {
        font-size: 2rem;
      }
      .secondary-name-wrapper {
        font-size: 1rem;
      }
    }
    .plant-info {
      flex-direction: row;
      gap: 40px;
    }
    .actions {
      flex-direction: row;
      gap: 20px;
    }
  }
  @media only screen and (min-width: ${BREAKPOINTS.desktop}) {
    .actions {
      gap: 30px;
    }
  }
`

const Info = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  .needs {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .row {
    background: #f6f6f6;
    padding: 10px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    img {
      height: 30px;
      width: 30px;
    }
    .column {
      flex: 1;
      p {
        font-size: 0.8rem;
      }
    }
  }
  .misc-info {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 0.9rem;
    .difficulty,
    .toxicity {
      font-weight: bold;
      font-size: 0.8rem;
      padding: 2px 10px;
      border-radius: 15px;
      background: #eee;
      color: #999;
      &.easy,
      &.nontoxic {
        background: #f1f9eb;
        color: ${COLORS.mediumLight};
      }
      &.moderate {
        background: #fff0e6;
        color: ${COLORS.alert};
      }
      &.hard,
      &.toxic {
        background: #ffe6e6;
        color: ${COLORS.danger};
      }
    }
  }
  .links {
    color: #999;
    display: flex;
    gap: 8px;
    a {
      font-size: 0.8rem;
      text-decoration: underline;
    }
  }
  @media only screen and (min-width: ${BREAKPOINTS.tablet}) {
    .row {
      gap: 15px;
      img {
        height: 35px;
        width: 35px;
      }
      .column {
        p {
          font-size: 1rem;
        }
      }
    }
  }
`

const Bar = styled.div`
  background: rgba(0, 0, 0, 0.1);
  height: 15px;
  border-radius: 10px;
  margin-top: 5px;
  @media only screen and (min-width: ${BREAKPOINTS.tablet}) {
    height: 20px;
  }
`

const Indicator = styled.div`
  background: linear-gradient(to right, ${COLORS.light}, ${COLORS.mediumLight});
  height: 100%;
  border-radius: 10px;
  width: ${props => props.level === '1' && '25%'};
  width: ${props => props.level === '1-2' && '50%'};
  width: ${props => props.level === '1-3' && '100%'};
  width: ${props => props.level === '2' && '50%'};
  width: ${props => props.level === '2-3' && '75%'};
  width: ${props => props.level === '3' && '100%'};
`

const SuggestionSubmission = styled.div`
  padding: 20px 0;
  h3 {
    margin-bottom: 20px;
  }
  .instructions {
    p {
      margin-bottom: 20px;
    }
  }
  .info-text {
    font-size: 0.8rem;
    margin-bottom: 5px;
    opacity: 0.7;
  }
  button {
    margin: 20px auto 0 auto;
  }
  .login {
    text-align: center;
    button {
      display: flex;
      gap: 8px;
    }
  }
`

const AdminSection = styled.section`
  background: #fff;
  .suggestions-admin {
    margin: 20px 0;
  }
  .suggestions-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    .suggestion {
      font-size: 0.8rem;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      padding: 10px 0;
      .user {
        color: ${COLORS.accent};
        font-weight: bold;
        .id {
          color: #999;
          font-weight: normal;
        }
      }
      .text {
        font-size: 1rem;
      }
      .source {
        color: ${COLORS.accent};
        text-decoration: underline;
      }
      .ant-select {
        max-width: 200px;
      }
    }
  }
  .admin-buttons {
    display: flex;
    gap: 12px;
    border-top: 1px dotted #ccc;
    padding-top: 20px;
  }
`

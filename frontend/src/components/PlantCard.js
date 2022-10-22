import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../constants'
import { useQueryClient } from 'react-query'
import axios from 'axios'
import { UserContext } from '../contexts/UserContext'
import styled from 'styled-components/macro'
import { COLORS } from '../GlobalStyles'
import { ImageLoader } from './loaders/ImageLoader'
import { ActionBar } from './ActionBar'
import { LikeOutlined, DislikeOutlined } from '@ant-design/icons'
import { FaPaw } from 'react-icons/fa'
import placeholder from '../assets/plant-placeholder.svg'
import sun from '../assets/sun.svg'
import water from '../assets/water.svg'
import temp from '../assets/temp.svg'
import humidity from '../assets/humidity.svg'
// import { FadeIn } from './loaders/FadeIn'

export const PlantCard = ({ plant, pendingReview, viewNeeds }) => {
  const queryClient = new useQueryClient()
  const { currentUser } = useContext(UserContext)

  const handleApprove = () => {
    if (
      window.confirm(
        'Are you sure you want to approve this plant? It will become publicly visible.'
      )
    ) {
      try {
        axios.put(`${API_URL}/plants/${plant._id}`, { review: 'approved' })
        queryClient.invalidateQueries('plants-to-review')
      } catch (err) {
        console.log(err)
      }
    }
  }

  const handleReject = plantId => {
    if (window.confirm('Are you sure you want to reject this plant?')) {
      try {
        axios.put(`${API_URL}/plants/${plant._id}`, { review: 'rejected' })
        queryClient.invalidateQueries('plants-to-review')
      } catch (err) {
        console.log(err)
      }
    }
  }

  return (
    <Wrapper key={plant._id}>
      {/* TODO: rejected indicator */}
      {plant.review === 'pending' && (
        <div className='pending-review'>
          {currentUser.role === 'admin' && (
            <button onClick={handleApprove}>
              <LikeOutlined />
            </button>
          )}
          <span className='label'>PENDING REVIEW</span>
          {currentUser.role === 'admin' && (
            <button onClick={() => handleReject(plant._id)}>
              <DislikeOutlined />
            </button>
          )}
        </div>
      )}
      <Div>
        {!plant.toxic && (
          <Stamp>
            <FaPaw />
          </Stamp>
        )}
        <InfoLink to={`/plant/${plant._id}`}>
          <div className='thumbnail'>
            <ImageLoader src={plant.imageUrl} alt={''} placeholder={placeholder} />
          </div>
          <div className='name'>
            <p className='primary-name'>{plant.primaryName.toLowerCase()}</p>
            <p className='secondary-name'>{plant.secondaryName.toLowerCase()}</p>
          </div>
        </InfoLink>
      </Div>
      <Needs expanded={viewNeeds}>
        <Row>
          <img src={sun} alt='light' />
          <Bar>
            {plant.light === 'low to bright indirect' && <Indicator level={'1'} />}
            {plant.light === 'medium indirect' && <Indicator level={'1-2'} />}
            {plant.light === 'medium to bright indirect' && <Indicator level={'2'} />}
            {plant.light === 'bright indirect' && <Indicator level={'2-3'} />}
            {plant.light === 'bright' && <Indicator level={'3'} />}
          </Bar>
        </Row>
        <Row>
          <img src={water} alt='water' />
          <Bar>
            {plant.water === 'low' && <Indicator level={'1'} />}
            {plant.water === 'low to medium' && <Indicator level={'1-2'} />}
            {plant.water === 'medium' && <Indicator level={'2'} />}
            {plant.water === 'medium to high' && <Indicator level={'2-3'} />}
            {plant.water === 'high' && <Indicator level={'3'} />}
          </Bar>
        </Row>
        <Row>
          <img src={temp} alt='temperature' />
          <Bar>
            {plant.temperature === 'average' && <Indicator level={'1-2'} />}
            {plant.temperature === 'warm' && <Indicator level={'3'} />}
          </Bar>
        </Row>
        <Row>
          <img src={humidity} alt='humidity' />
          <Bar>
            {plant.humidity === 'average' && <Indicator level={'1-2'} />}
            {plant.humidity === 'high' && <Indicator level={'3'} />}
          </Bar>
        </Row>
      </Needs>
      <ActionBar plantId={plant._id} />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  padding: 10px;
  transition: 0.2s ease-in-out;
  position: relative;
  width: 100%;
  max-width: 300px;
  &:hover {
    color: ${COLORS.darkest};
  }
  .pending-review {
    background: orange;
    color: #fff;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    text-align: center;
    z-index: 1;
    font-size: 0.8rem;
    padding: 5px 20px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    font-weight: bold;
    button {
      background: #fff;
      color: orange;
      margin: 0 5px;
      display: grid;
      place-content: center;
      padding: 5px;
      border-radius: 50%;
      &:hover,
      &:focus {
        color: #000;
      }
    }
  }
`

const Div = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`

const Stamp = styled.div`
  background: #c4c4c4;
  color: #fff;
  position: absolute;
  border-radius: 50%;
  display: grid;
  padding: 5px;
  z-index: 0;
  img {
    height: 15px;
    width: 15px;
  }
`

const InfoLink = styled(Link)`
  display: grid;
  place-items: center;
  .thumbnail {
    width: 100%;
    max-width: 250px;
    aspect-ratio: 1 / 1;
  }
  img {
    width: 100%;
    border-radius: 50%;
    object-fit: cover;
    &.placeholder {
      width: 80%;
      object-fit: contain;
    }
  }
  .name {
    color: ${COLORS.darkest};
    max-width: 230px;
    margin: 5px;
    text-align: center;
    align-self: center;
    transition: 0.2s ease-in-out;
  }
  .primary-name {
    font-weight: bold;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .secondary-name {
    font-style: italic;
    font-size: 0.8rem;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &:hover {
    p {
      color: ${COLORS.mediumLight};
    }
  }
`

const Needs = styled.div`
  padding: 0 10px;
  visibility: ${props => (props.expanded ? 'visible' : 'hidden')};
  opacity: ${props => (props.expanded ? '1' : '0')};
  max-height: ${props => (props.expanded ? '1000px' : '0')};
  transition: 0.3s ease-in-out;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
  img {
    height: 25px;
  }
`

const Bar = styled.div`
  background: #f2f2f2;
  height: 15px;
  flex: 1;
  margin-left: 5px;
  border-radius: 10px;
`

const Indicator = styled.div`
  background: linear-gradient(to right, ${COLORS.lightest}, ${COLORS.light});
  height: 100%;
  border-radius: 10px;
  width: ${props => props.level === '1' && '20%'};
  width: ${props => props.level === '1-2' && '50%'};
  width: ${props => props.level === '1-3' && '100%'};
  width: ${props => props.level === '2' && '50%'};
  width: ${props => props.level === '2-3' && '80%'};
  width: ${props => props.level === '3' && '100%'};
`

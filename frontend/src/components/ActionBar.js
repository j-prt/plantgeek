import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios'
import { useQueryClient } from 'react-query'
import { UserContext } from '../contexts/UserContext'

import styled from 'styled-components/macro'
import { COLORS } from '../GlobalStyles'
import { RiPlantLine } from 'react-icons/ri'
import { TiHeartOutline } from 'react-icons/ti'
import { AiOutlineStar } from 'react-icons/ai'

export const ActionBar = ({ plantId }) => {
  const queryClient = new useQueryClient()
  const { currentUser } = useContext(UserContext)
  const [submitting, setSubmitting] = useState(false)

  const handleList = list => {
    setSubmitting(true)
    let data
    if (list === currentUser.collection) {
      data = { collection: plantId }
    } else if (list === currentUser.favorites) {
      data = { favorites: plantId }
    } else if (list === currentUser.wishlist) {
      data = { wishlist: plantId }
    }
    if (list && list.find(id => id === plantId)) {
      // REMOVES PLANT
      axios.put(`/${currentUser.username}/remove`, data).then(res => {
        if (res.status === 200) {
          console.log(res)
          console.log(`Removed ${plantId} from user's list!`)
          queryClient.invalidateQueries('current-user')
          setSubmitting(false)
        } else if (res.status === 404) {
          console.log('Something went wrong')
          setSubmitting(false)
        }
      })
    } else {
      // ADDS PLANT
      axios.put(`/${currentUser.username}/add`, data).then(res => {
        if (res.status === 200) {
          console.log(res)
          console.log(`Added ${plantId} to user's list!`)
          queryClient.invalidateQueries('current-user')
          setSubmitting(false)
        } else if (res.status === 404) {
          console.log('Something went wrong')
          setSubmitting(false)
        }
      })
    }
  }

  return (
    <>
      {currentUser && (
        <Wrapper>
          <Action
            className='collection'
            aria-label='collect'
            onClick={() => handleList(currentUser.collection)}
            disabled={submitting}
            added={currentUser.collection.find(id => id === plantId)}>
            <RiPlantLine />
          </Action>
          <Action
            className='wishlist'
            aria-label='wishlist'
            onClick={() => handleList(currentUser.wishlist)}
            disabled={submitting}
            added={currentUser.wishlist.find(id => id === plantId)}>
            <AiOutlineStar />
          </Action>
          <Action
            className='favorites'
            aria-label='favorite'
            onClick={() => handleList(currentUser.favorites)}
            disabled={submitting}
            added={currentUser.favorites.find(id => id === plantId)}>
            <TiHeartOutline />
          </Action>
        </Wrapper>
      )}
    </>
  )
}

const Wrapper = styled.div`
  background: #f2f2f2;
  width: 90%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  align-self: center;
  margin: 5px 0;
  border-radius: 20px;
  padding: 5px;
`

const Action = styled.button`
  color: #000;
  opacity: ${props => (props.added ? '1' : '0.5')};
  border-radius: 50%;
  height: 30px;
  width: 30px;
  display: grid;
  place-content: center;
  font-size: 1.3rem;
  &:hover,
  &:focus {
    background: #ccc;
  }
  &:disabled {
    opacity: 0.5;
    pointer-events: none;
  }
  &.collection {
    background: ${props => (props.added ? COLORS.light : '')};
  }
  &.wishlist {
    background: ${props => (props.added ? '#ffd24d' : '')};
  }
  &.favorites {
    background: ${props => (props.added ? '#b493e6' : '')};
  }
`

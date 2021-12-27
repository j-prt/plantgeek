import React, { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { requestPlants, receivePlants } from '../actions.js'
import { UserContext } from '../contexts/UserContext'

import styled from 'styled-components/macro'
import { COLORS } from '../GlobalStyles'
import { BiSend } from 'react-icons/bi'

export const Comments = ({ plant }) => {
  const dispatch = useDispatch()
  const { currentUser } = useContext(UserContext)

  const [comment, setComment] = useState('')
  const handleComment = (ev) => {
    setComment(ev.target.value)
  }

  const submitComment = (ev) => {
    ev.preventDefault()
    // FIXME: use axios
    fetch(`/plants/${plant._id}/comments`, {
      method: 'PUT',
      body: JSON.stringify({
        comments: { comment: comment, username: currentUser.username },
      }),
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
    }).then((res) => {
      if (res.status === 200) {
        console.log(`Posted a new comment about ${plant.species}`)
        setComment('')
        dispatch(requestPlants())
        axios
          .get('/plants')
          .then((res) => dispatch(receivePlants(res.data.data)))
          .catch((err) => console.log(err))
      } else if (res.status === 404) {
        console.log('Something went wrong')
      }
    })
  }

  return (
    <Wrapper>
      <h2>comments</h2>
      <form>
        <textarea
          type='text'
          onChange={handleComment}
          placeholder='Do you have any questions or tips you would like to share?'
          value={comment}
        />
        <button type='submit' onClick={submitComment}>
          <BiSend />
        </button>
      </form>
      {plant.comments ? (
        <>
          {plant.comments.map((comment) => {
            return (
              <Card key={comment}>
                <Username to={`/user-profile/${comment.username}`}>{comment.username}</Username>
                <Comment>{comment.comment}</Comment>
              </Card>
            )
          })}
        </>
      ) : (
        <Card>No comments yet.</Card>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.section`
  background: #f2f2f2;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  margin: 15px;
  padding: 10px 20px;
  width: 300px;
  flex: 1;
  h2 {
    margin-bottom: 5px;
  }
  form {
    background: #fff;
    height: 100px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin: 10px 0;
    border: 2px solid transparent;
    border-radius: 20px;
    overflow: hidden;
    transition: 0.2s ease-in-out;
    textarea {
      width: 90%;
      margin: 10px;
      border: none;
      resize: none;
      &:focus {
        outline: none;
      }
    }
    &:focus-within {
      border: 2px solid ${COLORS.light};
    }
    button {
      align-self: flex-end;
      margin-right: 10px;
      padding-top: 5px;
      font-size: 1.7rem;
      &:hover {
        color: ${COLORS.light};
      }
    }
  }
`

const Card = styled.div`
  background: #fff;
  margin: 5px 0;
  border-radius: 20px;
  padding: 10px;
`

const Username = styled(Link)`
  font-size: 0.8rem;
`

const Comment = styled.p`
  color: #333;
`

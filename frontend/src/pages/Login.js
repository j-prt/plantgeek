import React, { useState, useEffect, useContext } from 'react'
import { useHistory } from 'react-router'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { usersArray } from '../reducers/userReducer'
import { LoginContext } from '../context/LoginContext'

import styled from 'styled-components/macro'
import { COLORS } from '../GlobalStyles'
import background from '../assets/monstera-bg.jpg'
import { Ellipsis } from '../components/loaders/Ellipsis'

// TODO: formik, jwt authentication token
export const Login = () => {
  const history = useHistory()
  const users = useSelector(usersArray)
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [incorrectUsername, setIncorrectUsername] = useState(undefined)
  const [incorrectPassword, setIncorrectPassword] = useState(undefined)
  const { currentUser, setLoggedIn } = useContext(LoginContext)

  // makes window scroll to top between renders
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleUsername = (ev) => {
    setUsername(ev.target.value)
  }

  const handlePassword = (ev) => {
    setPassword(ev.target.value)
  }

  const handleLogin = (ev) => {
    ev.preventDefault()
    setLoading(true)
    // resets values between login attempts
    setIncorrectUsername(undefined)
    setIncorrectPassword(undefined)
    if (users.length > 0) {
      fetch('/login', {
        method: 'POST',
        body: JSON.stringify({
          username: username,
          password: password,
        }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        if (res.status === 200) {
          // TODO: return user data from backend and setLoggedIn using user id or email and push to profile with username
          setLoggedIn({
            username: username,
            timestamp: new Date().getTime(),
          })
          setLoading(false)
          history.push(`/user-profile/${username}`)
        } else if (res.status === 403) {
          console.log('Incorrect password!')
          setIncorrectPassword(true)
          setLoading(false)
        } else if (res.status === 401) {
          console.log('Incorrect username!')
          setIncorrectUsername(true)
          setLoading(false)
        } else if (res.status === 500) {
          console.log('Internal server error!')
        }
        // return res.json()
      })
    } else {
      console.log('No users registered!')
      setIncorrectUsername(true)
      setLoading(false)
    }
  }

  return (
    <Wrapper>
      <Card>
        {currentUser ? (
          <Alert>You're already logged in, {currentUser.username}!</Alert>
        ) : (
          <>
            <SignUpLink to='/signup'>Don't have an account? Sign up</SignUpLink>
            <Welcome>
              <h1>welcome</h1>
            </Welcome>
            <FormWrapper autoComplete='off'>
              <Label htmlFor='username'>username</Label>
              <Input
                required
                type='text'
                name='login'
                id='username'
                onChange={handleUsername}
                error={incorrectUsername}
                autoFocus
              />
              <Error error={incorrectUsername}>This username doesn't exist.</Error>
              <Label htmlFor='password'>password</Label>
              <Input
                required
                type='password'
                name='login'
                id='password'
                onChange={handlePassword}
                error={incorrectPassword}
              />
              <Error error={incorrectPassword}>Incorrect password.</Error>
              <Button
                type='submit'
                onClick={handleLogin}
                disabled={!username || !password || loading}>
                {loading ? <Ellipsis /> : 'LOG IN'}
              </Button>
            </FormWrapper>
          </>
        )}
      </Card>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background: url(${background}) center center / cover;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Card = styled.div`
  background: ${COLORS.lightest};
  display: flex;
  flex-direction: column;
  width: 500px;
`

const Alert = styled.div`
  text-align: center;
  font-size: 1.5rem;
  padding: 50px;
`

const SignUpLink = styled(Link)`
  background: ${COLORS.medium};
  color: #fff;
  padding: 5px;
  display: flex;
  justify-content: center;
  &:hover {
    background: #1a1a1a;
    color: #fff;
  }
`

const Welcome = styled.div`
  background: ${COLORS.light};
  padding: 20px;
  h1 {
    margin: 10px;
    text-align: center;
  }
`

export const FormWrapper = styled.form`
  background: ${COLORS.lightest};
  display: flex;
  flex-direction: column;
  padding: 0 30px;
`

export const Label = styled.label`
  background: ${COLORS.lightest};
  width: fit-content;
  position: relative;
  top: 15px;
  left: 30px;
  padding: 0 10px;
  font-size: 0.9rem;
  border-radius: 10px;
`

export const Input = styled.input`
  background: ${COLORS.lightest};
  border: ${(props) => (props.error ? '2px solid #ff0000' : `2px solid ${COLORS.light}`)};
  border-radius: 15px;
  text-align: right;
  transition: 0.2s ease-in-out;
  &:focus {
    border: ${(props) => (props.error ? '2px solid #ff0000' : `2px solid ${COLORS.medium}`)};
    outline: none;
  }
`

export const Error = styled.p`
  visibility: ${(props) => (props.error ? 'visible' : 'hidden')};
  max-height: ${(props) => (props.error ? '100px' : '0')};
  opacity: ${(props) => (props.error ? '1' : '0')};
  color: #ff0000;
  text-align: center;
  transition: 0.2s ease-in-out;
`

export const Button = styled.button`
  background: ${COLORS.darkest};
  color: ${COLORS.lightest};
  margin: 30px 0;
  border-radius: 15px;
  padding: 10px;
  &:hover {
    background: ${COLORS.medium};
  }
  &:focus {
    background: ${COLORS.medium};
  }
  &:disabled:hover {
    background: ${COLORS.darkest};
  }
`

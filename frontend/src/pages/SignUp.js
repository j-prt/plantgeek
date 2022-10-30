import React, { useState, useContext } from 'react'
import { Redirect, Link } from 'react-router-dom'
import { UserContext } from '../contexts/UserContext'

import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import YupPassword from 'yup-password'
import { FormItem } from '../components/forms/FormItem.js'
import { Input, Checkbox } from 'formik-antd'
import { Button, Alert } from 'antd'
import styled from 'styled-components/macro'
import { COLORS, BREAKPOINTS } from '../GlobalStyles'
import { FadeIn } from '../components/loaders/FadeIn.js'
import plantgeekLogo from '../assets/logo.webp'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

YupPassword(Yup) // extend yup

export const SignUp = () => {
  useDocumentTitle('Sign up | plantgeek')

  const { currentUser, handleSignup } = useContext(UserContext)
  const [loading, setLoading] = useState(false)

  const SignUpSchema = Yup.object().shape({
    firstName: Yup.string().min(2, 'Too short').max(30, 'Too long').required('First name required'),
    lastName: Yup.string().min(2, 'Too short').max(30, 'Too long').required('Last name required'),
    email: Yup.string().email('Invalid email').required('Email required'),
    username: Yup.string()
      .min(4, 'Too short')
      .max(20, 'Too long')
      .required('Username required')
      .matches(/^[a-zA-Z0-9]+$/, 'No special characters or spaces allowed'),
    password: Yup.string()
      .min(6, 'Too short')
      .minNumbers(1, 'Must include at least 1 number')
      .minSymbols(1, 'Must include at least 1 symbol')
      .required('Password required'),
    acceptedTerms: Yup.boolean()
      .required('Required')
      .oneOf([true], 'You must accept the Terms and Conditions'),
  })

  const handleSubmit = async (values, { setStatus }) => {
    setLoading(true)
    setStatus(undefined)
    const result = await handleSignup(values)
    if (result.error) {
      setStatus(result.error.message)
      setLoading(false)
    } else {
      localStorage.setItem('plantgeekToken', result.token)
    }
  }

  return currentUser ? (
    <Redirect to='/welcome' />
  ) : (
    <Wrapper>
      <FadeIn>
        <Card>
          <div className='header'>
            <h1>welcome!</h1>
            <img src={plantgeekLogo} alt='' />
          </div>
          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              username: '',
              password: '',
              acceptedTerms: false,
            }}
            validationSchema={SignUpSchema}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={handleSubmit}>
            {({ status, isSubmitting }) => (
              <Form>
                <FormItem name='firstName' label='First name'>
                  <Input name='firstName' type='text' placeholder='Jane' />
                </FormItem>
                <FormItem name='lastName' label='Last name'>
                  <Input name='lastName' type='text' placeholder='Doe' />
                </FormItem>
                <FormItem name='email' label='Email'>
                  <Input name='email' type='text' placeholder='janedoe@gmail.com' />
                </FormItem>
                <FormItem name='username' label='Username'>
                  <Input name='username' type='text' placeholder='JaneDoe' />
                </FormItem>
                <FormItem name='password' label='Password'>
                  <Input.Password name='password' type='password' placeholder='********' />
                </FormItem>
                <FormItem name='acceptedTerms'>
                  <Checkbox name='acceptedTerms'>
                    I have read and agree to the <Link to='/terms'>Terms and Conditions</Link>
                  </Checkbox>
                </FormItem>
                <Button
                  htmlType='submit'
                  type='primary'
                  size='large'
                  disabled={loading || isSubmitting}
                  loading={loading || isSubmitting}>
                  CREATE ACCOUNT
                </Button>
                {status && <Alert type='error' message={status} showIcon />}
                <p className='subtext'>
                  Already have an account? <Link to='/login'>Log in</Link>
                </p>
              </Form>
            )}
          </Formik>
        </Card>
      </FadeIn>
    </Wrapper>
  )
}

export const Wrapper = styled.main`
  justify-content: center;
`

export const Card = styled.div`
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 20px;
  overflow: hidden;
  .header {
    background: ${COLORS.light};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    border-radius: 10px;
    padding: 10px;
    img {
      height: 30px;
    }
    li {
      display: flex;
      font-size: 0.9rem;
      margin: 10px;
    }
  }
  .body {
    margin: 20px;
    text-align: center;
  }
  form {
    display: flex;
    flex-direction: column;
    margin: 20px 0;
  }
  a {
    text-decoration: underline;
  }
  .ant-btn {
    width: 100%;
    margin-top: 20px;
  }
  .ant-alert {
    margin-top: 10px;
  }
  .subtext {
    text-align: center;
    margin-top: 20px;
  }
  @media only screen and (min-width: ${BREAKPOINTS.tablet}) {
    margin: auto;
    max-width: 400px;
  }
  @media only screen and (min-width: ${BREAKPOINTS.desktop}) {
    flex-direction: row;
    max-width: fit-content;
    .header {
      min-width: 310px;
      padding: 20px;
      h1 {
        font-size: 1.8rem;
      }
      li {
        font-size: 1rem;
      }
    }
    form {
      margin: 0 0 0 20px;
      max-width: 300px;
    }
  }
`

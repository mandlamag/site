import React, { Component } from 'react'
import ReactMarkdown from 'react-markdown'
import { ThemeProvider } from '@hackclub/design-system'
import fetch from 'unfetch'
import { api } from '../../data'
import { Heading } from '@hackclub/design-system'

function flatten(text, child) {
  return typeof child === 'string'
  ? text + child
  : React.Children.toArray(child.props.children).reduce(flatten, text)
}

const CustomHeading = props => {
  const children = React.Children.toArray(props.children)
  const text = children.reduce(flatten, '')
  const slug = text.toLowerCase()
                   .replace(/\s+/g, '-')
                   .replace(/[^a-z-]/g, '')

  return React.createElement(`h${props.level}`, {id: slug}, props.children)
}

export default class extends Component {
  constructor(props) {
    super(props)

    const { content, path } = props

    this.state = {
      status: (content ? 'success' : (path ? 'loading' : 'error')),
      content: content
    }
  }

  componentWillMount() {
    const { status } = this.state
    const { path } = this.props

    if (status === 'success') {
      return null
    }

    this.setState({
      status: 'loading'
    })

    fetch(`${api}/v1/repo/${path}`)
      .then(res => {
        if (res.ok) {
          return res.text()
        } else {
          throw res
        }
      })
      .then(md => {
        this.setState({
          content: md,
          status: 'success'
        })
      })
      .catch(e => {
        console.error(e)
        this.setState({status: 'error'})
      })
  }

  render() {
    const { content, renderers } = this.state

    return (
      <ThemeProvider>
        <ReactMarkdown source={content}
                       renderers={{heading: CustomHeading, ...renderers}}
        />
      </ThemeProvider>
    )
  }
}

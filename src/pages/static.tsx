import { GetStaticProps, InferGetStaticPropsType } from 'next'
import Head from 'next/head'


//https://nextjs.org/docs/messages/invalid-getstaticpaths-value
// export const getStaticPaths = async () => {
//   return {
//     paths: ['/static/terms'],
//     fallback: false
//   }
// }

export const getStaticProps: GetStaticProps<{
  hello: string
}> = async (context) => {
  //const slug = context.params?.page as string
  const pageData = {
    hello: "world"
  }

  return {
    props: {
      ...pageData
    }
  }
}

const TermsConditions = (
  props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  const {  hello } = props

  return (
    <>
      <Head>
        <title>static</title>
      </Head>
      
      {hello}
      
    </>
  )
}

export default TermsConditions

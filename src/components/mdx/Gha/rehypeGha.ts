import { rehypeGithubAlerts } from 'rehype-github-alerts'

export const rehypeGha = (...args: Parameters<typeof rehypeGithubAlerts>) => {
  const [options] = args

  return rehypeGithubAlerts({
    ...options,
    build(alertOptions, originalChildren) {
      return {
        type: 'element',
        tagName: 'Gha',
        properties: {
          keyword: alertOptions.keyword,
          icon: alertOptions.icon as any,
          title: alertOptions.title,
        },
        children: [...originalChildren],
      }
    },
  })
}

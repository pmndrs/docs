import fs from 'fs'

import recursive from 'recursive-readdir'

type FileData = {
  lib: string,
  title: string,
  path: string,
  fullPath: string,
  slug: string,
  ext: string
}

function dataFromPath(path: string): FileData {

  const [_, lib, ...pathArray] = path.split('/')
  const file = pathArray.pop()
  const [slug, ext] = file.split('.')
  
  return {
    lib,
    path: path.replace('_docs/', ''),
    title: slug.replace('-', ' '),
    fullPath: path,
    slug,
    ext
  }

}

export async function getAllDocs(): Promise<FileData[]> {
  const paths = (await recursive('_docs')).filter(file => file.indexOf('.md') > -1)

  return paths.map(dataFromPath)
}

export default {
  // fileServer:'http://localhost:5321/',
  // coverPath:'http://localhost:5321/cover/',
  // musicPath:'http://localhost:5321/lib/'
  coverPath: 'https://file.vcollection.org/cover/',
  musicPath: 'https://file.vcollection.org/lib/',
  musicExt: 'aac',
}
export const apiUrl = process.env.NODE_ENV === 'development' ? 'https://file.vcollection.org/cover/' : 'https://api.vcollection.org'

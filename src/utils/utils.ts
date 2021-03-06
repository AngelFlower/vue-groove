import {File} from '@/store/modules/file'
import Vue from 'vue'
import config from '@/utils/config'
import Confirm from '@/components/Common/Confirm.vue'
import CreatePlayListModal from '@/components/CreatePlayListModal.vue'
import DropdownList from '@/components/Common/DropdownList.vue'
import store from '@/store/index'
import {Plugins, Sortable} from '@shopify/draggable'
import SelectContainer from '@/mixins/selectContainer'
import {PlayListContentDataItem} from '@/store/modules/playList'
import LoginModal from '@/components/LoginModal.vue'

const {commit} = store

export function randomNum(n: number): string {
  let rnd = ''
  for (let i = 0; i < n; i++) {
    rnd += Math.floor(Math.random() * 10)
  }
  return rnd
}

export function initResourceInfo(arr: File[]) {
  _initResourceInfo(arr, [])
}

function _initResourceInfo(arr: File[], path: string[]) {
  for (const file of arr) {
    if (file.content) {
      _initResourceInfo(file.content || [], path.concat([file.title]))
    } else {
      const pathStr = path.join('/')
      const imgUrl = `${config.coverPath}/small/${pathStr}/${file.title}.jpg`
      const musicUrl = `${config.musicPath}${pathStr}/${file.title}.${config.musicExt}`
      file.imgUrl = imgUrl
      file.musicUrl = musicUrl
      file.album = path[0]
      file.token = file.p + '/' + file.title
      file.id = getFileId(file.p, file.title, file.album)
    }
  }
}

export function getFileId(artist: string, title: string, album: string) {
  return `${artist}/${title}/${album}`
}


function _convertFilesToLinearArray(arr: File[], tmp: File[]) {
  for (const file of arr) {
    if (file.content) {
      _convertFilesToLinearArray(file.content || [], tmp)
    } else {
      tmp.push(file)
    }
  }
}

export function convertFilesToLinearArray(arr: File[]) {
  const tmp: File[] = []
  _convertFilesToLinearArray(arr, tmp)
  return tmp
}

/*export function isInSelf(node: HTMLElement, target: HTMLElement): boolean {
  if (node === target) {
    return true;
  }
  if (node.parentNode) {
    return isInSelf(<HTMLElement>node.parentNode, target);
  } else {
    return false;
  }
}*/


export function isInSelf(node: HTMLElement, className: string): boolean {
  if (node === document.body) {
    return false
  }
  if (typeof node.className !== 'string') {
    return false
  }
  if (node.className.indexOf(className) !== -1) {
    return true
  }
  if (node.parentNode) {
    return isInSelf(node.parentNode as HTMLElement, className)
  } else {
    return false
  }
}

export function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

interface IConfirmConfig {
  title: string
  info: string
  onCancel?: () => {}
}

export function confirm(opt: IConfirmConfig) {
  return new Promise(((resolve) => {
    const confirmModal = Vue.extend(Confirm)
    const contain = document.createElement('div')
    document.body.appendChild(contain)

    function remove() {
      vm.$destroy()
      document.body.removeChild(vm.$el)
    }

    const vm = new confirmModal({
      el: contain,
      propsData: {
        cb: () => {
          // @ts-ignore
          vm.show = false
          setTimeout(() => {
            remove()
          }, 3000)
          resolve()
        },
        cancel: () => {
          // @ts-ignore
          vm.show = false
          setTimeout(() => {
            remove()
          }, 3000)

          if (opt.onCancel) {
            opt.onCancel()
          }
        },
        ...opt,
      },
    })
    // @ts-ignore
    vm.show = true
  }))
}


export function showLoginModal() {
  return createModel(LoginModal, {}, 200)
}

function createModel(modal: any, props?: object, animateTime: number = 200) {
  return new Promise((resolve) => {
    const contain = document.createElement('div')
    document.body.appendChild(contain)

    function remove() {
      vm.$destroy()
      document.body.removeChild(vm.$el)
    }

    const vm = new modal({
      el: contain,
      store,
      propsData: {
        show: false,
        onOk: (...args) => {
          vm.show = false
          setTimeout(() => {
            remove()
          }, animateTime)
          resolve(...args)
        },
        onCancel: () => {
          vm.show = false
          setTimeout(() => {
            remove()
          }, animateTime)
        },
        ...props,
      },
    })
    vm.show = true
  })
}

interface IEditPlayListModalConfig {
  isRename?: boolean
  oldName?: string
  onCancel?: () => {}
}

export function showEditPlayListModal(options?: IEditPlayListModalConfig, animateTime: number = 200) {
  return createModel(CreatePlayListModal, options, animateTime)
}


export interface DropDownMenuItem {
  label?: string
  callback?: () => {}
  split?: boolean
  isDisable?: boolean
  children?: DropDownMenuItem[]
  el?: any
}

export function dropDownMenu(e: Event, opts: DropDownMenuItem[], onCancel?: () => {}) {   // 传递{split:true}为分割线
  const contain = document.createElement('div')
  document.body.appendChild(contain)

  function remove() {
    vm.$destroy()
    document.body.removeChild(vm.$el)
    if (onCancel) {
      onCancel()
    }
  }

  const vm = new DropdownList({
    el: contain,
    propsData: {
      e,
      items: opts,
      remove,
    },
  })
  // @ts-ignore
  vm.show = true
}

export function union(arr1: PlayListContentDataItem[], arr2: PlayListContentDataItem[]) {
  const arr = []
  for (const file of arr1) {
    // if (arr.indexOf(arr1[i]) === -1) {
    if (arr.findIndex((o) => o.title === file.title && o.p === file.p) === -1) {
      arr.push(file)
    }
  }
  for (const file of arr2) {
    if (arr.findIndex((o) => o.title === file.title && o.p === file.p) === -1) {
      arr.push(file)
    }
  }
  return arr
}


export function unionFiles(arr1: File[], arr2: File[]) {
  const arr = []
  for (const file of arr1) {
    if (arr.findIndex((o) => o.id === file.id) === -1) {
      arr.push(file)
    }
  }
  for (const file of arr2) {
    if (arr.findIndex((o) => o.id === file.id) === -1) {
      arr.push(file)
    }
  }
  return arr
}


export function toggleFullScreen() {
  const document: any = window.document
  const el = document.body
  const isFullscreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen
  if (!isFullscreen) {// 进入全屏,多重短路表达式
    (el.requestFullscreen && el.requestFullscreen()) ||
    (el.mozRequestFullScreen && el.mozRequestFullScreen()) ||
    (el.webkitRequestFullscreen && el.webkitRequestFullscreen()) || (el.msRequestFullscreen && el.msRequestFullscreen())
    store.commit('home/setIsFullScreen', true)

  } else {	// 退出全屏,三目运算符
    document.exitFullscreen ? document.exitFullscreen() :
      document.mozCancelFullScreen ? document.mozCancelFullScreen() :
        document.webkitExitFullscreen ? document.webkitExitFullscreen() : void
          store.commit('home/setIsFullScreen', false)
  }
}

export function fullScreen() {
  const el: any = document.body;
  (el.requestFullscreen && el.requestFullscreen()) ||
  (el.mozRequestFullScreen && el.mozRequestFullScreen()) ||
  (el.webkitRequestFullscreen && el.webkitRequestFullscreen()) || (el.msRequestFullscreen && el.msRequestFullscreen())
  store.commit('home/setIsFullScreen', true)
}

export function exitFullScreen() {
  const document: any = window.document
  document.exitFullscreen ? document.exitFullscreen() :
    document.mozCancelFullScreen ? document.mozCancelFullScreen() :
      document.webkitExitFullscreen ? document.webkitExitFullscreen() : ''
}

export function isFullScreen() {
  const document: any = window.document
  return document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen
}

export function fadeInFileContent() {
  const content = document.querySelector('.Files>.content') as HTMLElement
  content.className = 'content'
  // content.style.opacity = '0'
  content.style.visibility = 'hidden'
  setTimeout(() => {
    // content.style.opacity = '1'
    content.style.visibility = 'visible'

    content.className = 'content fade-in'
  })
}


export function getAllFileByContent(topContent: File[]): File[] {
  const tmp: File[] = []

  function pushItem(content: File[]) {
    for (const file of content) {
      if (file.content) {
        pushItem(file.content)
      } else {
        tmp.push(file)
      }
    }
  }

  pushItem(topContent)
  return tmp
}

export function getAddFileToContextMenuItems(files: File[], context?: SelectContainer) {
  const contextMenu: any = []
  files = getAllFileByContent(files)
  contextMenu.push({
    label: '正在播放',
    callback: () => {
      store.dispatch('playList/addToPlayingList', files)
      if (context) {
        context.selectedItems = []
      }
    },
  })
  contextMenu.push({split: true})

  contextMenu.push({
    label: '新的播放列表', callback: () => {
      showEditPlayListModal().then((name) => {
        store.dispatch('playList/createPlayList', {
          name,
          content: files.map((o: File) => new PlayListContentDataItem(o.title, o.p, o.album)),
        })
        if (context) {
          context.selectedItems = []
        }
      })
    },
  })

  const playLists = store.state.playList.playLists

  if (playLists.length > 0) {
    playLists.forEach((o) => {
      contextMenu.push({
        label: o.title,
        callback: () => {
          store.dispatch('playList/addToPlayList', {
            listId: o.id,
            content: files.map((file) => new PlayListContentDataItem(file.title, file.p, file.album)),
          })
          if (context) {
            context.selectedItems = []
          }
        },
      })
    })
  }

  return contextMenu
}


export function mapDataItemsToFiles(items: PlayListContentDataItem[]): File[] {
  const res: File[] = []
  const allFile = store.state.file.allFile
  items.forEach((item) => {
    res.push(allFile.find((o) => o.title === item.title && o.p === item.p) || new File())
  })
  return res
}

export interface SortListHack {
  onStart?: (e: any) => void
  onSort?: (e: any) => void
  onEnd?: (e: any) => void
}

declare global {
  interface Window {
    ActiveXObject: any
  }
}
export function isIE() {
  return !!window.ActiveXObject || 'ActiveXObject' in window
}

export function SortList(container: HTMLElement, hacks: SortListHack, opt?: any) {
  const {onStart, onSort, onEnd} = hacks
  const mergeOpt = {
    draggable: 'li',
    // delay:300,
    swapAnimation: {
      duration: 200,
      easingFunction: 'ease-in-out',
      horizontal: true,
    },
    plugins: [Plugins.SwapAnimation],
    ...opt,

  }
  const sortable = new Sortable(container, mergeOpt)
  if (onStart) {
    sortable.on('sortable:start', onStart)
  }
  if (onSort) {
    sortable.on('sortable:sort', onSort)
  }
  if (onEnd) {
    sortable.on('sortable:stop', onEnd)
  }
}

export function playAllSelectFile(context: SelectContainer) {

  context.$store.dispatch('file/playDirs', context.selectedItems)
  context.selectedItems = []
}

/*export function playAllFile(files: File[]) {
  store.dispatch('file/playDirs', files);
}*/

/*export function playAllSelectFile(context: SelectContainer, files: Array<File>) {
  files.sort(function (e1, e2) {
    if (e1.trck > e2.trck) return 1;
    if (e1.trck < e2.trck) return -1;
    return 0;
  });
  context.$store.dispatch('file/playDirs', context.selectedItems);
  context.selectedItems = [];
}*/

/*export function addFileToPlayList(context: SelectContainer, content: Array<PlayListContentDataItem>, listId: string) {
  context.$store.dispatch('playList/addToPlayList', {listId, content:});
}*/

export function getLargeImg(url: string) {
  return url.replace('/small/', '/large/')
}

export function beginAddTime() {
  const state = store.state.audio
  clearInterval(state.timer)
  const timer = setInterval(() => {
    store.commit('audio/syncCurrentTime')
  }, 1000 / state.fps)
  store.commit('audio/setTimer', timer)
}

export function convertTimeStrToSecond(timeStr: string): number {
  const time = timeStr.split(':').map((o) => parseInt(o, 10))
  return time[0] * 60 + time[1]
}

export function getOffsetTop(obj: HTMLElement): number {
  return obj.offsetTop + (obj.offsetParent ? getOffsetTop(obj.offsetParent as HTMLElement) : 0)
}

export function getOffsetLeft(obj: HTMLElement): number {
  return obj.offsetLeft + (obj.offsetParent ? getOffsetLeft(obj.offsetParent as HTMLElement) : 0)
}

export function getToken(artist: string, title: string) {
  return `${artist}/${title}`
}


export function beginPlay() {
  const player = document.getElementById('player') as HTMLAudioElement
  if (!player.paused || store.state.audio.isLoading) {
    return
  }
  player.play()
  setPlayTimer()
  commit('audio/setPlaying', true)
}

export function pausePlay() {
  const player = document.getElementById('player') as HTMLAudioElement
  if (player.paused) {
    return
  }
  player.pause()
  commit('audio/setPlaying', false)
  clearInterval(store.state.audio.timer)
}

export function setPlayTimer() {
  const {fps} = store.state.audio
  const timer = setInterval(() => {
    commit('audio/syncCurrentTime', 1 / fps)
  }, 1000 / fps)
  commit('audio/setTimer', timer)
}


export function getCurrentPath() {
  // return window.location.pathname.
}

export function assert(bool: boolean, msg?: string) {
  if (!bool) {
    throw new Error(msg)
  }
}


export function getInvalidFile(files: File[]) {
  return files.filter((o) => !store.state.file.allFile.some((file) => file.id === getFileId(o.p, o.title, o.album)))
}

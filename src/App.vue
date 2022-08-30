<template>
  <div id="app">
    <header>
      <b-navbar type="dark">
        <b-navbar-brand>원신 뮤직 플레이 리스트</b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav>
            <b-nav-item-dropdown id="g-album-toggle" :class="{ 'selected-album': playType === 'album' }" text="앨범 리스트">
              <b-dropdown-item v-for="album in albums" :key="album.id" class="rounded mx-2" @click="albumClicked(album)">
                <img class="rounded m-1" :src="album.image" width="54" height="30">
                <span class="mr-1" :class="{ 'selected-playlist': playType === 'album' && album.id === playId }" style="flex: 1;">{{ album.name }}</span>
                <span class="mr-1 badge badge-secondary">{{ album.playlist.length }}</span>
              </b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item-dropdown id="c-album-toggle" :class="{ 'selected-album': playType === 'playlist' }" text="사용자 앨범">
              <b-dropdown-item class="rounded mx-2" v-b-modal.album-create><span class="d-inline-block m-1">앨범 생성</span></b-dropdown-item>
              <b-dropdown-divider v-if="playlists.length" />
              <b-dropdown-item v-for="album in playlists" :key="album.id" class="rounded mx-2" @click="playlistClicked(album)">
                <span class="m-1" :class="{ 'selected-playlist': playType === 'playlist' && album.id === playId }" style="flex: 1;">{{ album.name }}</span>
                <span class="mr-1 badge badge-secondary">{{ album.playlist.length }}</span>
              </b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>

          <b-navbar-nav class="ml-auto">
            <b-nav-text><span class="d-inline-block mr-1 py-1">사용자 앨범</span></b-nav-text>
            <b-nav-text><b-button size="sm" class="mx-1" variant="outline-secondary" @click="customAlbumExport"><b-icon icon="download" /> 저장</b-button></b-nav-text>
            <b-nav-text><b-button size="sm" class="mx-1" variant="outline-secondary" v-b-modal.album-import><b-icon icon="upload" /> 복원</b-button></b-nav-text>
            <b-nav-text><b-button size="sm" class="ml-1" variant="outline-secondary" v-b-modal.notice><b-icon icon="info-lg" /></b-button></b-nav-text>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
    </header>

    <main>
      <div id="video"></div>
      <div id="playlist-panel">
        <div id="playlist">
          <b-form-checkbox-group v-model="selected">
            <ul class="list-group list-group-flush">
              <li class="list-group-item" v-for="(playitem, index) in getPlaylist()" :key="playitem.id" :class="{ 'list-group-item-secondary': index === playIndex }">
                <div class="d-flex">
                  <b-form-checkbox class="mx-0 my-auto" v-if="playType === 'album'" :value="playitem.id" />
                  <b-icon :icon="index === playIndex ? 'play-fill' : 'play'" width="32" height="32" class="my-auto flex-shrink-1 play-button" @click="musicClicked(index)" />
                  <div class="w-100 ms-2">
                    <div class="d-flex">
                      <div class="w-100 mr-1">{{ index + 1 }}. {{ playitem.title }}</div>
                      <div class="flex-shrink-1">{{ duration(playitem) }}</div>
                    </div>
                    <div class="progress" style="height: 6px;" v-if="index === playIndex">
                      <div class="progress-bar progress-bar-striped bg-success" role="progressbar" :class="{ 'progress-bar-animated': isPlaying }" :style="'width: ' + percent(playitem) + '%'"></div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </b-form-checkbox-group>
        </div>
        <b-button-group class="playlist-edit-delete" v-if="playType === 'album'">
          <b-button squared @click="appendToCustomAlbum">
            <div style="display: inline-block; position: relative; padding: 0.125rem; line-height: 0; margin-top: auto; margin-bottom: auto;">
              <b-icon icon="collection" width="16" height="16" />
              <b-badge v-if="selected.length" style="position: absolute; top: 0%; left: 100%; transform: translate(-50%, -50%);">{{ selected.length }}</b-badge>
            </div>
          </b-button>
        </b-button-group>
        <b-button-group class="playlist-edit-delete" v-if="playType !== 'album'">
          <b-button squared @click="customAlbumModify">
            <b-icon class="my-1" icon="pencil-square" width="16" height="16" />
          </b-button>
          <b-button class="remove" squared v-b-modal.album-remove>
            <b-icon class="my-1" icon="trash" width="16" height="16" />
          </b-button>
        </b-button-group>
      </div>

      <b-modal id="notice" size="md" title="알림" dialog-class="modal-notice" scrollable ok-only>
        <div class="my-1">
          <p>
            영상재생은 사용자 상호작용에 의해서만 재생됩니다. - <a href="https://developers.google.com/youtube/iframe_api_reference?hl=ko#Autoplay_and_scripted_playback" target="_blank">참고</a><br>
            동영상의 시작위치가 0초일경우 제어가 불가능하여 시작위치가 잘리는 곡이있습니다.<br>
          </p>
          <p>
            버그발견 시 <a href="https://tgd.kr/s/saja_mori/65904978" target="_blank">첫 배포 글</a>에 댓글로 알려주시면 감사합니다!<br>
            <span style="color: rgba(0, 0, 0, .5);">단지 트게더 접속을 자주 하지 않는다는건 안비밀.</span>
          </p>
          <hr>
          <p class="text-center">변경내용</p>
          <p>
            <strong>2022-08-29</strong><br>초기 샘플 리스트 오타수정<br>다이얼로그 사이즈 계산문제 수정<br>
            <strong>2022-08-31</strong><br>사용자 앨범의 곡 삭제기능 구현<br>
          </p>
        </div>
      </b-modal>

      <b-modal id="album-create" title="앨범 추가" @show="resetAlbumCreateModal" @hidden="resetAlbumCreateModal" @ok="onAlbumCreateOk" dialog-class="modal-import">
        <form ref="album-create-form" @submit.stop.prevent="onAlbumCreateSubmit">
          <b-form-group label="앨범명" label-for="name-input" invalid-feedback="앨범명을 입력하세요." :state="newAlbum.nameState">
            <b-form-input id="name-input" v-model="newAlbum.name" :state="newAlbum.nameState" required />
          </b-form-group>
        </form>
      </b-modal>

      <b-modal id="album-remove" title="앨범 제거" @ok="onCustomAlbumRemoveOk" dialog-class="modal-remove">
        <div class="my-1">
          재생중인 플레이 리스트({{getAlbumName()}})를 제거합니다.<br>
        </div>
      </b-modal>

      <b-modal id="album-import" title="플레이 리스트 불러오기" @show="resetAlbumImportData" @hidden="resetAlbumImportData" @ok="onAlbumImportOk" dialog-class="modal-notice">
        <form ref="album-import-form" @submit.stop.prevent="onAlbumImportSubmit">
          <b-form-group label="저장된 앨범 선택" label-for="file-input" invalid-feedback="파일을 선택해주세요." :state="Boolean(importData.file)">
            <b-form-file id="file" v-model="importData.file" @change="customAlbumImport($event)" />
          </b-form-group>
          <div class="text-danger"><strong>사용자 앨범 복원하기를하면 현재 사용자 앨범은 초기화되어 교체됩니다.</strong></div>
          <div class="text-danger">백업된 파일이 아니거나 잘못 된 파일을 선택할 경우 오작동 할 수 있습니다.</div>
        </form>
      </b-modal>

      <b-modal id="album-track-append" size="lg" title="선택곡 담기" @ok="onAppendToCustomAlbumOk" dialog-class="modal-append" scrollable>
        <form ref="album-track-append-form" @submit.stop.prevent="onAppendToCustomAlbumSubmit">
          <b-row>
            <b-col cols="7">
              아래곡을 선택된 사용자 앨범에 추가합니다.
              <b-list-group>
                <b-list-group-item class="py-1 px-2" v-for="track in append.tracks" :key="track.id">
                  <b-row>
                    <b-col>{{ track.title }}</b-col>
                    <b-col sm="auto">{{ duration(track) }}</b-col>
                  </b-row>
                </b-list-group-item>
              </b-list-group>
            </b-col>
            <b-col>
              사용자 앨범
              <b-form-checkbox-group v-model="append.targets" :options="append.albums" />
              <b-form-invalid-feedback :state="append.state">하나이상의 대상 앨범을 선택하세요.</b-form-invalid-feedback>
            </b-col>
          </b-row>
        </form>
      </b-modal>

      <b-modal id="album-track-empty" size="lg" title="선택곡 담기" dialog-class="modal-append" ok-only>
        <div class="my-1">
          선택된 곡이 없습니다. 앨범에서 곡을 선택하세요.
        </div>
      </b-modal>

      <b-modal id="album-modify" title="앨범 편집" @hidden="resetCustomAlbumModify" @ok="onCustomAlbumModifyOk" dialog-class="modal-modify" scrollable>
        <form @submit.stop.prevent="onCustomAlbumModifySubmit">
          <div role="group">
            <label for="input-name">앨범명</label>
            <b-form-input id="input-name" v-model="edit.name" placeholder="앨범명을 입력하세요" trim />
          </div>
          <div class="mt-3">항목을 드래그하여 순서를 변경하거나 체크하여 제거합니다.</div>
          <b-list-group>
            <b-form-checkbox-group v-model="edit.selected">
              <draggable v-model="edit.playlist">
                <transition-group>
                  <b-list-group-item class="py-1 px-2" style="cursor: grab;" v-for="track in edit.playlist" :key="track.id">
                    <b-row>
                      <b-col><b-form-checkbox :value="track.id">{{ track.title }}</b-form-checkbox></b-col>
                      <b-col sm="auto">{{ duration(track) }}</b-col>
                    </b-row>
                  </b-list-group-item>
                </transition-group>
              </draggable>
            </b-form-checkbox-group>
          </b-list-group>
        </form>

        <template #modal-footer="{ ok, cancel }">
          <div class="modal-modify-footer m-0">
            <div>
              <b-button class="m-1" variant="danger" @click="removeTrack" :disabled="edit.selected.length === 0">Remove</b-button>
            </div>
            <div>
              <b-button class="m-1" variant="secondary" @click="cancel()">Cancel</b-button>
              <b-button class="m-1" variant="primary" @click="ok()">OK</b-button>
            </div>
          </div>
        </template>
      </b-modal>
    </main>
  </div>
</template>

<script>
import YoutubePlayer from 'youtube-player'
import draggable from 'vuedraggable'
import albums from './albums.js'

const PlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
}
const samplePlaylist = { id: 'c1', name: '샘플 리스트', playlist: [
  { id: '1', vid: 'AALrH26HAmw', start: { m: 6, s: 0 }, end: { m: 7, s: 48 }, title: 'Dusk in Mondstadt', ref: { album: 'a01:1', track: 'a01:1-05' } },
  { id: '2', vid: '3-EkbYNPi6Q', start: { m: 0, s: 5 }, end: { m: 2, s: 2 }, title: 'Pathos of Shirasagi', ref: { album: 'a10:1', track: 'a10:1-01' } },
  { id: '3', vid: 'AALrH26HAmw', start: { m: 9, s: 38 }, end: { m: 10, s: 31 }, title: 'Another Day in Mondstadt', ref: { album: 'a01:1', track: 'a01:1-08' } },
  { id: '4', vid: '3-EkbYNPi6Q', start: { m: 25, s: 14 }, end: { m: 26, s: 40 }, title: 'Suffering of Parting', ref: { album: 'a10:1', track: 'a10:1-18' } },
  { id: '5', vid: '3-EkbYNPi6Q', start: { m: 26, s: 40 }, end: { m: 28, s: 44 }, title: 'Under the Sun', ref: { album: 'a10:1', track: 'a10:1-19' } },
  { id: '6', vid: '3-EkbYNPi6Q', start: { m: 30, s: 54 }, end: { m: 33, s: 8 }, title: 'Nothing but a Dream', ref: { album: 'a10:1', track: 'a10:1-21' } },
  { id: '7', vid: 'aeEkatw2Heg', start: { m: 32, s: 51 }, end: { m: 34, s: 30 }, title: 'Midday Prospects', ref: { album: 'a01:2', track: 'a01:2-24' } },
]}

const defaultData = {
  albums: albums,
  playlists: [],
  selected: [],
  importData: {
    file: null,
    data: null,
  },
  newAlbum: {
    name: '',
    nameState: null,
  },
  edit: {
    id: null,
    name: null,
    playlist: [],
    selected: [],
  },
  append: {
    tracks: [],
    albums: [],
    targets: [],
    state: null,
  },
  playId: 'c1',
  playType: 'playlist', // album or playlist
  playIndex: 0,
  currentTime: 0.0,
  timerId: null,
  isPlaying: false,
}

const dbName = 'Genshin Music Mix'
const dbVersion = 1
const dbStoreKey = 'id'
const dbStoreName = 'Custom Albums'
const dbStoreIndex = 'album_id'

var player = null
var ready = false

function initIndexedDB(event) {
  if (event.oldVersion === 0) {
    // 초기화
    const db = event.target.result
    if (db.objectStoreNames.contains(dbStoreName) == false) {
      var store = db.createObjectStore(dbStoreName, { keyPath: dbStoreKey })

      store.createIndex(dbStoreIndex, dbStoreKey)
      store.put(samplePlaylist)
    }
  }
}

function errorIndexedDB(event) {
  console.log(event.target.errorCode)
}

function syncToIndexedDB(playlists) {
  if (!window.indexedDB) {
    return
  }
  const openRequest = indexedDB.open(dbName, dbVersion)

  openRequest.onupgradeneeded = initIndexedDB
  openRequest.onsuccess = function (event) {
    console.log('sync to db begin')

    const db = event.target.result
    const tx = db.transaction(dbStoreName, 'readwrite')
    const store = tx.objectStore(dbStoreName)

    tx.oncomplete = function() {
      console.log('sync to db complete')
    }

    var order = []

    store.getAllKeys().onsuccess = function (event) {
      var keys = event.target.result

      playlists.forEach(function (playlist) {
        let index = keys.indexOf(playlist.id)
        if (index != -1) {
          keys.splice(index, 1)
        }
        order.push(playlist.id)
        store.put(playlist)
      })

      keys.forEach(function (key) {
        store.delete(key)
      })
      store.put({ id: 'c0', list: order })
    }
    openRequest.onerror = errorIndexedDB
  }
}

export default {
  name: 'App',
  components: {
    draggable,
  },
  data () {
    return defaultData
  },
  mounted () {
    this.$bvModal.show('notice')

    if (window.indexedDB) {
      const $this = this
      const openRequest = indexedDB.open(dbName, dbVersion)

      openRequest.onupgradeneeded = initIndexedDB
      openRequest.onsuccess = function (event) {
        const db = event.target.result
        const tx = db.transaction(dbStoreName, 'readonly')
        const store = tx.objectStore(dbStoreName)
        const getRequest = store.getAll()

        getRequest.onsuccess = function (event) {
          let records = event.target.result
          if (records && records.length) {
            var playlists = []
            if (records[0].id == 'c0') {
              let order = records[0].list
              order.forEach(function (id) {
                let playlist = records.find(function (record) { return record.id == id })
                if (playlist) {
                  playlists.push(playlist)
                }
              })
            } else {
              playlists = records
            }
            playlists.forEach(function (playlist) {
              $this.playlists.push(playlist)
            })
          }
          $this.createPlayer()
        }
      }
      openRequest.onerror = errorIndexedDB
    } else {
      this.createPlayer()
    }
  },
  beforeDestroy () {
    if (this.timerId != null) {
      clearTimeout(this.timerId)

      this.timerId = null
    }
  },
  methods: {
    toSecs (ms) {
      return Math.max(2, ms.m * 60 + ms.s);
    },
    createPlayer() {
      player = YoutubePlayer('video', {
        width: '100%',
        height: '100%',
      })
      player.on('ready', () => {
        this.checkPosition()
      })
      player.on('stateChange', (event) => {
        if (ready && event.data == PlayerState.ENDED) {
          this.updateVideo(1)
        }
        if (event.data == PlayerState.PLAYING) {
          ready = true
        }
        this.isPlaying = (event.data == PlayerState.PLAYING)
      })
      this.updateVideo()
    },
    getAlbum() {
      var album = null
      var albums = null
      if (this.playType == 'album') {
        albums = this.albums
      } else {
        albums = this.playlists
      }
      albums.forEach((item) => {
        if (item.id === this.playId) {
          album = item
        }
      })
      return album
    },
    getAlbumName() {
      var album = this.getAlbum()
      if (album) {
        return album.name
      } else {
        return 'unknown'
      }
    },
    getPlaylist () {
      var playlist = null
      var playlists = null
      if (this.playType == 'album') {
        playlists = this.albums
      } else {
        playlists = this.playlists
      }
      playlists.forEach((item) => {
        if (item.id === this.playId) {
          playlist = item.playlist
        }
      })
      return playlist
    },
    percent (item) {
      var start = this.toSecs(item.start)
      var end = this.toSecs(item.end)

      var duration = end - start
      var position = this.currentTime - start

      position = Math.min(Math.max(0, position), duration)

      return (position / duration) * 100.0
    },
    duration (item) {
      var start = this.toSecs(item.start)
      var end = this.toSecs(item.end)

      var duration = end - start;

      var minute = Math.floor(duration / 60)
      var seconds = duration % 60

      return minute.pad(2) + ':' + seconds.pad(2)
    },
    checkPosition () {
      if (ready) {
        Promise.all([player.getPlayerState(), player.getCurrentTime()]).then((values) => {
          var state = values[0]
          var current = values[1]

          var playlist = this.getPlaylist()
          if (playlist === null || playlist.length <= this.playIndex) {
            if (state === PlayerState.PLAYING) {
              player.stopVideo()
            }
            return
          }

          if (state === PlayerState.PLAYING) {
            var index = this.playIndex
            var start = this.toSecs(playlist[index].start)
            var end = this.toSecs(playlist[index].end)

            this.currentTime = current;

            if (start > current + 1 || end < current - 1)
            {
              this.updateVideo(1)
            }
          }
        }).catch(() => {})
      }
      this.timerId = setTimeout(this.checkPosition, 300)
    },
    updateVideo (offsetIndex, isOffset) {
      if (typeof isOffset !== 'boolean') {
        isOffset = true
      }
      if (typeof offsetIndex !== 'number') {
        offsetIndex = 0
      }
      var playlist = this.getPlaylist()

      var index = isOffset ? this.playIndex + offsetIndex : offsetIndex
      var length = playlist.length
      while (index < 0) {
        index += length
      }

      ready = false
      index = index % length
      if (playlist.length > index) {
        const params = {
          videoId: playlist[index].vid,
          startSeconds: this.toSecs(playlist[index].start),
          endSeconds: this.toSecs(playlist[index].end),
        }
        player.loadVideoById(params);
        this.playIndex = index
      }
    },
    albumClicked (album) {
      this.playId = album.id
      this.playType = 'album'
      this.updateVideo(0, false)
    },
    playlistClicked (playlist) {
      this.playId = playlist.id
      this.playType = 'playlist'
      this.updateVideo(0, false)
    },
    musicClicked (index) {
      this.updateVideo(index, false)
    },
    customAlbumExport () {
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.playlists));
      var downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "playlist.json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    },
    customAlbumImport (event) {
      var reader = new FileReader();
      reader.onload = this.onCustomAlbumReaderLoad;
      reader.readAsText(event.target.files[0]);
    },
    onCustomAlbumReaderLoad (event) {
      this.$set(this.importData, 'data', JSON.parse(event.target.result))
    },
    resetAlbumImportData () {
      this.importData.file = null
      this.importData.data = null
    },
    onAlbumImportOk (bvModalEvent) {
      bvModalEvent.preventDefault()

      this.onAlbumImportSubmit()
    },
    onAlbumImportSubmit () {
      if (this.importData.data === null) {
        return
      }
      this.playlists.splice(0)
      this.$nextTick(() => { this.$bvModal.hide('album-import') })
      if (this.importData.data.length === 0) {
        return
      }
      this.importData.data.forEach((playlist) => {
        this.playlists.push(playlist)
      })
      this.playId = this.importData.data[0].id
      this.playType = 'playlist'
      this.updateVideo(0, false)

      syncToIndexedDB(this.playlists)
    },
    resetAlbumCreateModal () {
      this.newAlbum.name = ''
      this.newAlbum.nameState = null
    },
    checkAlbumCreateFormValidity () {
      const valid = this.$refs['album-create-form'].checkValidity()
      this.newAlbum.nameState = valid
      return valid
    },
    onAlbumCreateOk (bvModalEvent) {
      bvModalEvent.preventDefault()

      this.onAlbumCreateSubmit()
    },
    onAlbumCreateSubmit () {
      if (!this.checkAlbumCreateFormValidity()) {
        return
      }

      this.albumCreateInternal(this.newAlbum.name)
      this.$nextTick(() => { this.$bvModal.hide('album-create') })
    },
    albumCreateInternal(name) {
      var number = 1
      for (;;) {
        var index = this.playlists.findIndex((playlist) => playlist.id == ('c' + number))
        if (index == -1) {
          break;
        }
        number++
      }
      this.playlists.push({ id: 'c' + number, name: name, playlist: [] })

      syncToIndexedDB(this.playlists)
    },
    onCustomAlbumRemoveOk () {
      if (this.playType !== 'playlist') {
        return
      }
      var index = this.playlists.findIndex((playlist) => {
        return playlist.id === this.playId
      })
      if (index === -1) {
        return
      }
      this.playlists.splice(index, 1)

      if (this.playlists.length) {
        this.playId = this.playlists[0].id
        this.playType = 'playlist'
      } else {
        this.playId = this.albums[0].id
        this.playType = 'album'
      }
      this.updateVideo(0, false)

      syncToIndexedDB(this.playlists)
    },
    appendToCustomAlbum() {
      if (this.selected.length) {
        var $this = this

        if (this.playlists.length === 0) {
          this.albumCreateInternal('자동생성 앨범')
        }

        this.$bvModal.show('album-track-append')
        this.append.tracks.splice(0)
        this.append.albums.splice(0)
        this.append.targets.splice(0)
        this.selected.forEach(function (trackId) {
          var album = null
          var track = null

          if (albums.some(function (albumItem) {
            return albumItem.playlist.some(function (trackItem) {
              if (trackItem.id === trackId) {
                album = albumItem
                track = trackItem

                return true
              }
              return false
            })
          }) && album && track) {
            const item = {
              id: 't' + $this.append.tracks.length, // 임시 키
              vid: track.vid,
              start: { m: track.start.m, s: track.start.s },
              end: { m: track.end.m, s: track.end.s },
              title: track.title,
              ref: { album: album.id, track: track.id },
            }
            $this.append.tracks.push(item)
          }
        })
        this.playlists.forEach(function (playlist) {
          $this.append.albums.push({ text: playlist.name, value: playlist.id })
        })
      } else {
        this.$bvModal.show('album-track-empty')
      }
    },
    onAppendToCustomAlbumOk (bvModalEvent) {
      bvModalEvent.preventDefault()

      this.onAppendToCustomAlbumSubmit()
    },
    onAppendToCustomAlbumSubmit () {
      this.append.state = this.append.targets.length > 0
      if (this.append.state == false) {
        return
      }

      const $this = this
      this.append.targets.forEach(function (target) {
        var album = $this.playlists.find(function (playlist) { return playlist.id == target })
        if (album) {
          var num = 1
          $this.append.tracks.forEach(function (track) {
            while (album.playlist.some(function(trackItem) { return trackItem.id === num.toString() }))
            {
              num += 1
            }

            const item = {
              id: num.toString(),
              vid: track.vid,
              start: { m: track.start.m, s: track.start.s },
              end: { m: track.end.m, s: track.end.s },
              title: track.title,
              ref: { album: track.ref.album, track: track.ref.track },
            }
            album.playlist.push(item)
          })
        }
      })
      this.$nextTick(() => { this.$bvModal.hide('album-track-append') })
      this.selected.splice(0)
      this.append.albums.splice(0)
      this.append.tracks.splice(0)
      this.append.targets.splice(0)
      this.append.state = null

      syncToIndexedDB(this.playlists)
    },
    resetCustomAlbumModify () {
      this.edit.id = ''
      this.edit.name = ''
      this.edit.playlist.splice(0)
    },
    customAlbumModify () {
      if (this.playType !== 'playlist') {
        return
      }
      var $this = this
      var album = this.getAlbum()

      this.edit.id = album.id
      this.edit.name = album.name
      this.edit.playlist.splice(0)

      album.playlist.forEach(function (track) {
        $this.edit.playlist.push(track)
      })

      this.$bvModal.show('album-modify')
    },
    onCustomAlbumModifyOk (bvModalEvent) {
      bvModalEvent.preventDefault()

      this.onCustomAlbumModifySubmit()
    },
    onCustomAlbumModifySubmit () {
      if (this.playType !== 'playlist') {
        return
      }
      var $this = this
      var album = this.getAlbum()
      var trackId = album.playlist[this.playIndex].id
      var exists = false

      album.name = this.edit.name
      album.playlist.splice(0)
      this.edit.playlist.forEach(function (track, index) {
        album.playlist.push(track)
        
        if (track.id === trackId) {
          $this.playIndex = index

          exists = true
        }
      })
      if (exists === false) {
        this.updateVideo(0, false)
      }
      this.$nextTick(() => { this.$bvModal.hide('album-modify') })

      syncToIndexedDB(this.playlists)
    },
    removeTrack () {
      var $this = this
      this.edit.selected.forEach(function(trackId) {
        let index = $this.edit.playlist.findIndex(function(track) {
          return track.id === trackId
        })
        $this.edit.playlist.splice(index, 1)
      })
      this.edit.selected.splice(0)
    },
  },
}
</script>

<style>
html, body {
  height: 100vh;
}

main {
  display: flex !important;
  align-items: stretch;
  flex: 1;
  overflow: hidden;
}

#app {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100vh;
}

#g-album-toggle > .dropdown-menu,
#c-album-toggle >.dropdown-menu {
  color: rgb(222, 226, 230) !important;
  background-color: rgb(52, 58, 64);
  max-height: 25rem;
  overflow-y: scroll;
}

#g-album-toggle > .dropdown-menu .dropdown-item,
#c-album-toggle > .dropdown-menu .dropdown-item {
  color: rgb(222, 226, 230) !important;
  padding: 0 !important;
  border-radius: 0.25rem !important;
  display: flex;
  align-items: center;
}

#g-album-toggle > .dropdown-menu .dropdown-item:hover,
#c-album-toggle > .dropdown-menu .dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.selected-playlist,
.selected-album > .nav-link {
  color: rgb(0, 208, 97) !important;
}

#video {
  flex: 1;
}

#playlist-panel {
  width: 340px;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  background-color: #111 !important;
}

#playlist {
  flex: 1;
  overflow-y: auto;
}

.playlist-edit-delete {
  display: flex;

  border-width: 1px 0 0 0;
  border-color: #545b62;
  border-style: solid;
}

.playlist-edit-delete > button {
  flex: 1;

  border: none;
  background-color: #222;
}

.playlist-edit-delete > button:hover {
  color: rgb(0, 208, 97);

  background-color: #333;
}

.playlist-edit-delete > button.remove:hover {
  color: #dc3545;
}

.play-button {
  cursor: pointer;
  color: rgb(0, 208, 97);
  margin: 0.25rem;
}

.dropdown-divider {
  border-color: rgba(255, 255, 255, 0.2) !important;
}

#playlist .list-group-item {
  padding: 0.5rem !important;
  background-color: #111 !important;
  border-color: #666 !important;
  color: #eee !important;
}

#playlist .list-group-item-secondary {
  background-color: #222 !important;
}

.modal-import,
.modal-modify,
.modal-remove,
.modal-notice {
  color: rgb(52, 58, 64) !important;
}

.modal-append {
  color: rgb(52, 58, 64) !important;
}

.modal-modify-footer {
  display: flex;
  flex: 1;
}

.modal-modify-footer > div:first-child {
  flex: 1;
}
</style>

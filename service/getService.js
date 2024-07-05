/* eslint-disable no-useless-escape */
const fs = require('fs')

const regex_service = /import {? \w.*(-(service|report|master|support)|\.service|aim|budget|common|receive|provider)'/g
const regex_component = /from '((.|@\/)+vue)'/g
const getServiceVariable = (str) => str.substring(str.indexOf('const') + 6, str.indexOf('=') - 1)

const underScoreCase = (str) => str.replace(/\.?([A-Z])/g, function (x, y) { return "_" + y.toLowerCase() }).replace(/^_/, "")

const filterDateService = (f) => f.indexOf('DateService') === -1

const readComponentFile = (fileName, file, folder) => {
    let result = []
    const _file = file.toString('utf8')
    if (fileName === 'IndexView.vue') {
        // ######################### START FIND INDEX VIEW FILE ###########################
        let matchIndex = file ? _file.match(regex_service) : null

        if (matchIndex && matchIndex.length > 0) {
            matchIndex = matchIndex.filter(filterDateService)

            matchIndex.forEach((m) => {
                const service = m.substring(m.indexOf('{') + 1, m.indexOf('}'))
                const path = m.substring(m.indexOf('\'')).replace(/\'/g, '').replace('@/', `${this.ROOT_PATH}/`)

                const s = service.replace(/ /g, '')

                const regex = new RegExp('const \\w+ = new ' + s, 'g')
                const matchService = _file.match(regex)

                if (matchService && matchService.length) {
                    const sName = getServiceVariable(matchService[0]).replace(/ /g, '')
                    const regex1 = new RegExp('(' + sName + '.\\w+)', 'g')
                    const regexRm = new RegExp(sName + '.', 'g')
                    const match1 = _file.match(regex1)
                    const serviceName = match1 ? removeDuplicates(match1).map(m => m.replace(regexRm, '')) : []

                    const serviceObj = getServiceUrl({ folder, service: s, path, fileName, serviceName: serviceName.join(', '), serviceNames: serviceName })

                    result = [...result, ...serviceObj]
                }
            })
        }
        // ######################### END FIND INDEX VIEW FILE ###########################

        // ######################### START FIND CONTENT ###########################
        const regexFile = /(componentName|dropdownComponentName): '(.*?)'/g
        const regexPath = /(componentPath|dropdownComponentPath): '(.*?)'/g

        const matchFiles = _file.match(regexFile)
        const matchPaths = _file.match(regexPath)

        if (matchFiles) {
            matchFiles.forEach((mf, index) => {
                const mFile = (mf || '').replace(/(componentName|dropdownComponentName):/g, '').replace(/\'/g, '').replace(/,/g, '').replace(' ', '')
                const mPath = (matchPaths[index] || '').replace(/(componentPath|dropdownComponentPath):/g, '').replace(/\'/g, '').replace(/,/g, '').replace(' ', '')

                const path = `${this.ROOT_PATH}/views/${mPath}/${mFile}.vue`

                try {
                    const files = fs.readFileSync(path)
                    const content = files.toString('utf8')

                    // ######################### END FIND SUB CONTENT ###########################
                    const matchSubComponent = files ? content.match(regex_component) : null
                    if (matchSubComponent) {
                        matchSubComponent.forEach((mComponent) => {
                            let _mComponent = mComponent.replace(/from /, '').replace(/\'/g, '')
                            const componentFile = mComponent.substring(mComponent.lastIndexOf('/') + 1)

                            if (_mComponent.indexOf('./') !== -1) {
                                _mComponent = `${this.ROOT_PATH}/views/${mPath}/${_mComponent.replace(/.\//, '')}`
                            } else {
                                _mComponent = _mComponent.replace('@/', `${this.ROOT_PATH}/`)
                            }

                            const subContentFile = fs.readFileSync(`${_mComponent}`)

                            const _matchSubContent = subContentFile.toString('utf8')

                            let matchSubContent = subContentFile ? _matchSubContent.match(regex_service) : null

                            if (matchSubContent && matchSubContent.length > 0) {

                                matchSubContent = matchSubContent.filter(filterDateService)

                                matchSubContent.forEach((m) => {
                                    const service = m.substring(m.indexOf('{') + 1, m.indexOf('}'))
                                    const path = m.substring(m.indexOf('\'')).replace(/\'/g, '').replace('@/', `${this.ROOT_PATH}/`)

                                    const s = service.replace(/ /g, '')

                                    const regex = new RegExp('const \\w+ = new ' + s, 'g')
                                    const matchService = _matchSubContent.match(regex)


                                    if (matchService && matchService.length) {
                                        const sName = getServiceVariable(matchService[0]).replace(/ /g, '')
                                        const regex1 = new RegExp('(' + sName + '.\\w+)', 'g')
                                        const regexRm = new RegExp(sName + '.', 'g')
                                        const match1 = content.match(regex1)
                                        const serviceName = match1 ? removeDuplicates(match1).map(m => m.replace(regexRm, '')) : []

                                        const serviceObj = getServiceUrl({ folder, service: s, path, fileName: componentFile, serviceName: serviceName.join(', '), serviceNames: serviceName })

                                        result = [...result, ...serviceObj]
                                    }
                                })
                            }
                        })

                    }
                    // ######################### END FIND SUB CONTENT ###########################

                    let match = files ? content.match(regex_service) : null

                    if (match && match.length > 0) {
                        match = match.filter(filterDateService)

                        match.forEach((m) => {
                            const service = m.substring(m.indexOf('{') + 1, m.indexOf('}'))
                            const path = m.substring(m.indexOf('\'')).replace(/\'/g, '').replace('@/', `${this.ROOT_PATH}/`)

                            const serviceList = service.replace(/ /g, '').split(',')

                            serviceList.forEach(s => {
                                const regex = new RegExp('const \\w+ = new ' + s.replace(/\'/g, ''), 'g')

                                const matchService = content.match(regex)

                                if (matchService && matchService.length) {
                                    matchService.forEach(_matchService => {
                                        const sName = getServiceVariable(_matchService).replace(/ /g, '')
                                        const regex1 = new RegExp('(' + sName + '.\\w+)', 'g')
                                        const regexRm = new RegExp(sName + '.', 'g')
                                        const match1 = content.match(regex1)
                                        const serviceName = match1 ? removeDuplicates(match1).map(m => m.replace(regexRm, '')) : []

                                        const serviceObj = getServiceUrl({ folder, service: s, path, fileName: mFile, serviceName: serviceName.join(', '), serviceNames: serviceName })

                                        result = [...result, ...serviceObj]
                                    })
                                }
                            })
                        })
                    }
                    // eslint-disable-next-line no-unused-vars
                } catch (e) {
                    // console.log('err: ', e, folder)
                }
            })
        }

        // ######################### END FIND CONTENT ###########################
    }

    return result
}

const getServiceUrl = (obj) => {
    let result = []
    const { path, serviceNames, service } = obj

    const fileName = underScoreCase(service).replace(/_/g, '-').replace('-service', '')
    let folderName = path.substring(path.lastIndexOf('/') + 1)


    if (path.indexOf('.service') !== -1) {
        const list = path.split('/')
        list.pop()
        obj.path = list.join('/')
        folderName = list[list.length - 1]
    }

    const serviceFile = fs.readFileSync((obj.path + '/' + fileName.replace(folderName.replace('-service', ''), folderName)) + '.service.ts')

    serviceNames.forEach((s) => {
        const regex = new RegExp('public ' + s + '(.*\\s*.*\\s*.*`)')
        const regexApi = /api_\w.*'/g
        const _serviceFile = serviceFile.toString('utf-8')

        const matchServiceName = serviceFile ? _serviceFile.match(regex) : []
        const matchServiceApiPath = serviceFile ? _serviceFile.match(regexApi) : []

        if (matchServiceName && matchServiceName.length > 0) {
            matchServiceName.forEach(mServiceName => {
                const apiPath = matchServiceApiPath[0].replace('api_path = \'', '').replace('\'', '')
                const url = mServiceName

                const urlName = url.substring(url.indexOf('/') + 1, url.lastIndexOf('`'))

                result.push({ folder: obj.folder, url: `${apiPath}/${urlName.replace(/(\?).*/g, '')}` })
            })
        }
    })

    return result
}

const removeDuplicates = (arr) => {
    return arr.filter((item,
        index) => arr.indexOf(item) === index)
}

const { uniqWith } = require('lodash')

const getService = (appPath, module = []) => {
    let result = []
    this.ROOT_PATH = `${appPath.substring(0, appPath.indexOf('/src'))}/src`

    module.forEach(m => {
        this.APP_PATH = `${appPath}/${m}`
        const dirAll = fs.readdirSync(this.APP_PATH)

        dirAll.forEach((dir) => {
            const path_1 = `${this.APP_PATH}/${dir}`
            if (fs.lstatSync(path_1).isDirectory()) {
                const dirAll_1 = fs.readdirSync(path_1)

                // LEVEL 1
                dirAll_1.forEach((dir_1) => {
                    const path_2 = `${this.APP_PATH}/${dir}/${dir_1}`
                    if (fs.lstatSync(path_2).isDirectory()) {
                        const dirAll_2 = fs.readdirSync(path_2)

                        // LEVEL 2
                        dirAll_2.forEach((dir_2) => {
                            const path_3 = `${this.APP_PATH}/${dir}/${dir_1}/${dir_2}`
                            if (fs.lstatSync(path_3).isDirectory()) {
                                // const dirAll_3 = fs.readdirSync(path_3)

                                // LEVEL 3
                                // dirAll_3.forEach((dir_2) => {

                                // })
                            } else {
                                const files = fs.readFileSync(path_3)

                                const r2 = readComponentFile(dir_2, files, dir)

                                if (r2 && r2.length)
                                    result = [...result, ...r2]
                            }
                        })
                    } else {
                        const files = fs.readFileSync(path_2)

                        const r1 = readComponentFile(dir_1, files, dir)

                        if (r1 && r1.length)
                            result = [...result, ...r1]
                    }
                })
            } else {
                const files = fs.readFileSync(path_1)

                const r = readComponentFile(dir, files, dir)

                if (r && r.length)
                    result = [...result, ...r]
            }
        })
    })

    return uniqWith(result, (item1, item2) => item1.url === item2.url && item1.folder === item2.folder)
}

module.exports = {
    getService
}
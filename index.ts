import fs from 'fs'
import util from 'util'
import axios from 'axios'

const config = {
    API_URL: 'https://apigw.advanceautoparts.com/v18',
}

const $axios = axios.create({
    baseURL: config.API_URL,
    headers: {
        accept: '*/',
        'aap-b2c-debugid': 'bruh',
        'aap-b2c-requestid': 'God said 640x480 16 color was a covenant like circumcision.',
        'aap-b2c-sdk-user-type-for-debugging': 'generic'

        // bro i dont even know
        //
        // :authority: apigw.advanceautoparts.com
        // :method: GET
        // :path: /v18/vehicles?type=3&year=2008&make=Volkswagen&model=Rabbit%20S
        // :scheme: https
        // aap-b2c-debugid: b7f3f3a4-e1c4-4a7c-845b-d0d2f1caed8a
        // aap-b2c-requestid: sdk-6d752555-2c08-4f8e-80b1-e6044b577b92
        // aap-b2c-sdk-user-type-for-debugging: generic
        // accept: */*
        // accept-encoding: gzip, deflate, br
        // accept-language: en-US,en;q=0.9
        // authorization: Bearer eyJ0b2tlblR5cGUiOiJ3Y3MtY29va2llcyIsImNvb2tpZXMiOlt7Im5hbWUiOiJXQ19QRVJTSVNURU5UIiwidmFsdWUiOiJ1QURMVWZMJTJGU3RwY2t4clJnSkFyd3BBRCUyRjh3JTNEJTBBJTNCMjAyMi0wNC0xNSsxOSUzQTAyJTNBMDAuMjg4XzE2NTAwNjM3MjAyODgtMjgyMjAxNV8wIiwib3B0aW9ucyI6e319XX0=
        // cache-control: no-cache
        // origin: https://shop.advanceautoparts.com
        // pragma: no-cache
        // referer: https://shop.advanceautoparts.com/
        // sec-fetch-dest: empty
        // sec-fetch-mode: cors
        // sec-fetch-site: same-site
        // sec-gpc: 1
        // user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36
        // x-api-key
        // x-auth-method: cookie-token
        // x-lb-token: 0000S4mLIy6fnxB3kAu3KEey1GU:179sl2g38
        // x-pricing-token: eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGF0ZUlkIjoiNzg1NTIyZDItNTAyMC00NzdkLWI3YmMtYTQ2MmUxZjQzNzE2IiwiZXhwaXJlc0F0IjoxNjUwMDY3MzIwLCJpYXQiOjE2NTAwNjM3MjAsImV4cCI6MTY1MDA2NzMxOSwiYXVkIjoiaHR0cHM6Ly9zaG9wLmFkdmFuY2VhdXRvcGFydHMuY29tIn0._-U0MOqGAXS_C6SxBWXRAPxLWC8MhNAEuMkuxblk7HoNSSdevhrpc4uDerOxB2xSq8nyI_0vMO_D6LSI83YnSA
    }
})

// $axios.interceptors.response.use((response) => {
//     console.log('==========================================')
//     console.log(response.statusText)
//     console.log(response.headers)
//     console.log(response.data)
//     console.log('==========================================')
// })

const getAllYears = (): number[] => {
    const minimumYear = 1942
    const nowCurrentYear = (new Date()).getFullYear()

    const allYears: number[] = []

    for (let i = minimumYear; i <= nowCurrentYear; i++) {
        allYears.push(i)
    }

    return allYears
}

const getAllMakes = (options: {
    year: number
}): Promise<{ data: string[] }> => {
    return $axios.get('/vehicles/makes', {
        params: {
            type: 3, // i dont know why this is required.
            year: options.year
        }
    })
}

const getAllModels = (options: {
    make: string
    year: number
}): Promise<{ data: string[] }> => {
    return $axios.get('/vehicles/models', {
        params: {
            type: 3, // i dont know why this is required.
            year: options.year,
            make: options.make
        }
    })
}

const getAllEngines = (options: {
    make: string
    year: number
    model: string
}): Promise<{
    data: {
        code: string
        engine: string
        id: string
        make: string
        model: string
        type: "3"
        year: string
    }[]
}> => {
    return $axios.get('/vehicles', {
        params: {
            type: 3, // i dont know why this is required.
            year: options.year,
            make: options.make,
            model: options.model
        }
    })
}

// for all years, 1942 to 'CURRENT YEAR':
//      get all makes of this year
//      for each make of this year:
//          get all models of this make 
//          for each model of this year:
//              get all engines for this model
//              for each engine of this model:
//                  save in a csv: '2008 volkswagen rabbit 2.5'

const start = async (): Promise<void> => {
    const allYears = getAllYears()
    console.log(allYears)
    for (const year of allYears) {
        console.log(year)
        const res = await getAllMakes({ year })
        console.log('res of all makes: ', util.inspect(res.data, false, null, true))
        for (const carBrand of res.data) {
            console.log('car brand: ', carBrand)
            const res = await getAllModels({
                make: carBrand,
                year
            })

            console.log('res for models: ', util.inspect(res.data, false, null, true))

            for (const model of res.data) {
                const res = await getAllEngines({
                    make: carBrand,
                    year,
                    model
                })

                console.log('res for engines: ', util.inspect(res.data, false, null, true))

                for (const vehicle of res.data) {
                    console.log(`${year},${carBrand},${model},${vehicle.engine}, ${vehicle.code}`)

                    fs.appendFileSync('all_cars.csv', `
                        ${year},${carBrand},${model},${vehicle.engine}, ${vehicle.code}
                    `.trim())
                }
            }
        }
    }
}

start().then(() => {
    console.log("Done.\n\n$ cat output.csv\n\n\n");
    process.exit();
}).catch((err) => {
    console.error(err);
    process.exit();
})

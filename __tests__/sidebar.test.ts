import getSidebarNav from '../lib/getSidebarNav'

const files = {
  "react-three-fiber/advanced/index": {
    "isMDXComponent": true,
    "href": "react-three-fiber/advanced/index"
  },
  "react-three-fiber/advanced/how-it-works": {
    "isMDXComponent": true,
    "href": "react-three-fiber/advanced/how-it-works"
  },
  "react-three-fiber/advanced/instancing": {
    "isMDXComponent": true,
    "href": "react-three-fiber/advanced/instancing"
  },
  "zustand/index": {
    "isMDXComponent": true,
    "href": "zustand/index"
  },
  "zustand/installation": {
    "isMDXComponent": true,
    "href": "zustand/installation"
  }
}

it("works", () => {
  
  expect(getSidebarNav(files)).toEqual({
    "react-three-fiber": {
      "advanced": {
        "index": {
          "isMDXComponent": true,
          "href": "react-three-fiber/advanced/index",
        },
        "how-it-works": {
          "isMDXComponent": true,
          "href":"react-three-fiber/advanced/how-it-works",
        },
        "instancing": {
          "isMDXComponent": true,
          "href":"react-three-fiber/advanced/instancing",
        }
      }
    },
    "zustand": {
      "": {
        "index": {
          "isMDXComponent": true,
          "href": "zustand/index"
        },
        "installation": {
          "isMDXComponent": true,
          "href": "zustand/installation"
        },
      }
    }
  })
})

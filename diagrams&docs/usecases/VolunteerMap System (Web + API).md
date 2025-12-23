```mermaid
flowchart LR
  Guest((Khách))
  User((Người dùng))
  Owner((Chủ bài))
  Admin((Admin))

  Google[[Google OAuth]]
  Nominatim[[OSM Nominatim API]]
  Geo[[Browser Geolocation]]

  subgraph SYS["VolunteerMap System (Web + API)"]
    UC0([UC-0: Quản lý điểm hỗ trợ trên bản đồ & tương tác cộng đồng])
  end

  Guest --> UC0
  User --> UC0
  Owner --> UC0
  Admin --> UC0

  UC0 -. sử dụng .-> Google
  UC0 -. sử dụng .-> Nominatim
  UC0 -. sử dụng .-> Geo

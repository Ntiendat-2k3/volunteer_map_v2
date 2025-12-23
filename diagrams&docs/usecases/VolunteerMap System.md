```mermaid
flowchart TB
  %% Actors
  Guest((Khach))
  User((Nguoi dung))
  Owner((Chu bai))
  Admin((Admin))

  %% System
  subgraph SYS["VolunteerMap System"]
    direction TB

    subgraph AUTH["Xac thuc va Phien"]
      direction TB
      UCA["UC-A: Xac thuc va phien dang nhap"]
    end

    subgraph POSTS["Posts va Map"]
      direction TB
      UCP["UC-P: Ban do va bai dang diem ho tro"]
      UCG["UC-G: Tim dia chi va Reverse geocode"]
    end

    subgraph SUPPORT["Support Commit"]
      direction TB
      UCS["UC-S: Dang ky ho tro"]
      UCMGMT["UC-M: Quan ly ho tro va xuat Excel"]
    end

    subgraph COMMUNITY["Cong dong"]
      direction TB
      UCC["UC-C: Binh luan da cap (TikTok)"]
    end

    subgraph ADMIN_AREA["Quan tri"]
      direction TB
      UCAD["UC-AD: Admin duyet bai va dashboard"]
    end
  end

  %% Links
  Guest --> UCP
  Guest --> UCC

  User --> UCA
  User --> UCP
  User --> UCS
  User --> UCC
  User --> UCMGMT

  Owner --> UCP
  Owner --> UCMGMT
  Owner --> UCS
  Owner --> UCC

  Admin --> UCAD
  Admin --> UCP
  Admin --> UCMGMT
  Admin --> UCS
  Admin --> UCC

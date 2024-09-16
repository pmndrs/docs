import { cache } from 'react'

type Member = {
  MemberId: number
  role: 'ADMIN' | 'MEMBER' | 'BACKER' | 'ATTENDEE' | 'FOLLOWER'
  profile: string
  name: string
  image: string
  totalAmountDonated: number
  isActive: boolean
}

type Backer = Member & { role: 'BACKER' }

function isBacker(member: Member): member is Backer {
  return member.role === 'BACKER'
}

async function _fetchBackers(url: string): Promise<Backer[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error('Failed to fetch backers')

    const members: Member[] = await res.json()

    const uniqueBackers = new Map<string, Backer>()

    members.forEach((member) => {
      if (isBacker(member)) {
        const existingBacker = uniqueBackers.get(member.name)
        if (!existingBacker || member.totalAmountDonated > existingBacker.totalAmountDonated) {
          uniqueBackers.set(member.name, member)
        }
      }
    })

    return Array.from(uniqueBackers.values()).sort(
      (a, b) => b.totalAmountDonated - a.totalAmountDonated,
    )
  } catch (error) {
    console.error('Error fetching backers:', error)
    return []
  }
}

export const fetchBackers = cache(_fetchBackers)

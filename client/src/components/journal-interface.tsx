'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, RotateCcw, Plus, Save, Trash2, Edit2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

const MAX_PAGES = 10

const initialJournalPages = [
  {
    leftContent: "So much for the space bubblegum holding everything together! Rocket and I wouldn't be the big one if it weren't for a lucky save by Drax and Gamora in the Milano. We had to make a mad dash for it and I think the Milano got clear in time, but we haven't heard from \"Team Green\" since then. Hopefully this mining ship is just messing with the comms.",
    rightContent: "We've really ticked the hornet's nest. Seems like Rocket's thumpers are drawing out every monster but the one we want. But like Drax said, where there's food there's... things that eat food! I forget. Just need to bag this thing and get paid."
  },
  {
    leftContent: "Day 2 on this forsaken ship. The shadows seem to be growing longer, and I swear I can hear whispers in the walls. Rocket's been tinkering with some salvaged parts, says he's working on a \"shadow repellent\". I'm not sure if I should be impressed or concerned.",
    rightContent: "We found another one of those goo-stones today. This one was pulsing with a sickly green light. Drax wanted to smash it (of course), but I managed to convince him to let me study it first. There's something familiar about the energy signature, but I can't quite place it."
  }
]

export function JournalInterface() {
  const [journalPages, setJournalPages] = useState(initialJournalPages)
  const [currentPage, setCurrentPage] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState({ left: '', right: '' })
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const totalPages = journalPages.length

  useEffect(() => {
    const savedPages = localStorage.getItem('journalPages')
    if (savedPages) {
      setJournalPages(JSON.parse(savedPages))
    }
  }, [])

  const saveToLocalStorage = (pages) => {
    localStorage.setItem('journalPages', JSON.stringify(pages))
  }

  const turnPage = (direction: 'next' | 'prev') => {
    setIsFlipping(true)
    setTimeout(() => {
      if (direction === 'next' && currentPage < totalPages - 1) {
        setCurrentPage(currentPage + 1)
      } else if (direction === 'prev' && currentPage > 0) {
        setCurrentPage(currentPage - 1)
      }
      setIsFlipping(false)
    }, 500)
  }

  const goToPage = (pageIndex: number) => {
    if (pageIndex !== currentPage) {
      setIsFlipping(true)
      setTimeout(() => {
        setCurrentPage(pageIndex)
        setIsFlipping(false)
      }, 500)
    }
  }

  const addNewPage = () => {
    if (totalPages < MAX_PAGES) {
      const newPage = {
        leftContent: "New page left content. Start writing your adventure here!",
        rightContent: "New page right content. Continue your story on this side."
      }
      const newPages = [...journalPages, newPage]
      setJournalPages(newPages)
      saveToLocalStorage(newPages)
      goToPage(totalPages)
      setShowConfirmDialog(false)
      
      // Animate new page insertion
      const journalElement = document.querySelector('.journal')
      if (journalElement) {
        journalElement.classList.add('inserting-page')
        setTimeout(() => {
          journalElement.classList.remove('inserting-page')
        }, 1000)
      }
    } else {
      toast({
        title: "Maximum pages reached",
        description: "You can't add more than 10 pages to your journal.",
        variant: "destructive",
      })
    }
  }

  const deletePage = () => {
    if (totalPages > 1) {
      const newPages = journalPages.filter((_, index) => index !== currentPage)
      setJournalPages(newPages)
      saveToLocalStorage(newPages)
      setCurrentPage(Math.min(currentPage, newPages.length - 1))
      setShowDeleteDialog(false)
    } else {
      toast({
        title: "Cannot delete",
        description: "You must have at least one page in your journal.",
        variant: "destructive",
      })
    }
  }

  const startEditing = () => {
    setIsEditing(true)
    setEditContent({
      left: journalPages[currentPage].leftContent,
      right: journalPages[currentPage].rightContent
    })
  }

  const saveEdits = () => {
    const newPages = [...journalPages]
    newPages[currentPage] = {
      leftContent: editContent.left,
      rightContent: editContent.right
    }
    setJournalPages(newPages)
    saveToLocalStorage(newPages)
    setIsEditing(false)
  }

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center">
      <div className="relative w-[900px] h-[600px] flex items-center justify-center">
        {/* Journal */}
        <div 
          className="journal relative w-[800px] h-[500px] bg-[#f0e6d2] rounded-lg shadow-2xl overflow-hidden transform rotate-3"
          style={{
            boxShadow: '0 0 50px rgba(255, 255, 255, 0.1), 0 0 100px rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Page outlines */}
          {[...Array(totalPages * 2)].map((_, index) => (
            <div 
              key={index}
              className="absolute top-0 right-0 w-[98%] h-[98%] bg-[#e8d7b8] rounded-lg transform rotate-3 origin-left"
              style={{
                zIndex: -index,
                right: `${index * 0.5}px`,
                boxShadow: 'inset -2px 0 5px rgba(0,0,0,0.1)'
              }}
            />
          ))}

          {/* Journal pages */}
          <div className={`absolute inset-0 flex transition-transform duration-1000 ${isFlipping ? 'scale-x-0' : 'scale-x-100'}`}>
            {/* Left page */}
            <div className="w-1/2 p-8 font-handwriting text-lg leading-relaxed text-gray-800 overflow-y-auto">
              {isEditing ? (
                <Textarea
                  value={editContent.left}
                  onChange={(e) => setEditContent({ ...editContent, left: e.target.value })}
                  className="w-full h-full resize-none font-handwriting"
                />
              ) : (
                journalPages[currentPage].leftContent
              )}
            </div>
            {/* Right page */}
            <div className="w-1/2 p-8 font-handwriting text-lg leading-relaxed text-gray-800 overflow-y-auto">
              {isEditing ? (
                <Textarea
                  value={editContent.right}
                  onChange={(e) => setEditContent({ ...editContent, right: e.target.value })}
                  className="w-full h-full resize-none font-handwriting"
                />
              ) : (
                journalPages[currentPage].rightContent
              )}
            </div>
          </div>
        </div>

        {/* Page numbers as sticky notes */}
        <div className="absolute -top-4 -right-4 flex flex-col items-end space-y-2 transform -rotate-3">
          {journalPages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index)}
              className={`w-12 h-8 ${index === currentPage ? 'bg-red-500 -translate-x-1' : 'bg-yellow-200'} 
                         border border-gray-400 flex items-center justify-center 
                         text-sm font-bold ${index === currentPage ? 'text-white' : 'text-gray-700'}
                         transform hover:-translate-x-1 transition-transform duration-200 ease-in-out
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              style={{
                boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
                borderRadius: '0 0.25rem 0.25rem 0',
                zIndex: 20 - index
              }}
              aria-label={`Go to page ${index + 1}`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Control buttons */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => turnPage('prev')}
            disabled={currentPage === 0 || isFlipping}
            aria-label="Previous page"
            className="bg-[#d4b587] hover:bg-[#c4a577] text-gray-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => turnPage('next')}
            disabled={currentPage === totalPages - 1 || isFlipping}
            aria-label="Next page"
            className="bg-[#d4b587] hover:bg-[#c4a577] text-gray-800"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(0)}
            disabled={currentPage === 0 || isFlipping}
            aria-label="Back to first page"
            className="bg-[#d4b587] hover:bg-[#c4a577] text-gray-800"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Add new page"
                className="bg-[#d4b587] hover:bg-[#c4a577] text-gray-800"
                disabled={totalPages >= MAX_PAGES}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Page</DialogTitle>
                <DialogDescription>
                  Are you sure you want to add a new page to your journal?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
                <Button onClick={addNewPage}>Add Page</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Delete current page"
                className="bg-[#d4b587] hover:bg-[#c4a577] text-gray-800"
                disabled={totalPages <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Page</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this page? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={deletePage}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="icon"
            onClick={isEditing ? saveEdits : startEditing}
            aria-label={isEditing ? "Save edits" : "Edit page"}
            className="bg-[#d4b587] hover:bg-[#c4a577] text-gray-800"
          >
            {isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <style jsx>{`
        @keyframes insertPage {
          0% { transform: rotate(3deg) translateY(-100%); }
          100% { transform: rotate(3deg) translateY(0); }
        }
        .journal.inserting-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #f0e6d2;
          animation: insertPage 1s ease-out;
        }
      `}</style>
    </div>
  )
}
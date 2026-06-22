'use client'

import { useCallback, useState } from 'react'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { createCategory, deactivateCategory, updateCategory } from '@/services/admin-category-service'

import type { CategoryDto } from '@/types/category'

interface AdminCategoryListClientProps {
  initialCategories: CategoryDto[]
}

export function AdminCategoryListClient({ initialCategories }: AdminCategoryListClientProps): React.ReactElement {
  const t = useTranslations('common.admin.categories')
  const tForm = useTranslations('common.admin.categories.form')
  const tDelete = useTranslations('common.admin.categories.delete')
  const tActions = useTranslations('common.actions')
  const tColumns = useTranslations('dashboard.tables.columns')
  const [categories, setCategories] = useState<CategoryDto[]>(initialCategories)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null)

  const [createName, setCreateName] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [createIcon, setCreateIcon] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [editIsActive, setEditIsActive] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)
  const [isDeactivating, setIsDeactivating] = useState(false)

  const resetCreateForm = useCallback((): void => {
    setCreateName('')
    setCreateDescription('')
    setCreateIcon('')
  }, [])

  const openEditDialog = useCallback((category: CategoryDto): void => {
    setEditingCategory(category)
    setEditName(category.name)
    setEditSlug(category.slug)
    setEditDescription(category.description ?? '')
    setEditIcon(category.icon ?? '')
    setEditIsActive(category.isActive)
    setIsEditOpen(true)
  }, [])

  const handleCreate = useCallback(async (): Promise<void> => {
    if (!createName.trim()) return

    setIsCreating(true)

    try {
      const response = await createCategory({
        name: createName.trim(),
        description: createDescription.trim() || null,
        icon: createIcon.trim() || null
      })

      if (response.success && response.data) {
        setCategories((prev) => [response.data!, ...prev])
        toast.success(t('messages.createSuccess'))
        setIsCreateOpen(false)
        resetCreateForm()
      } else {
        toast.error(response.message)
      }
    } catch {
      toast.error(tActions('unknownError'))
    } finally {
      setIsCreating(false)
    }
  }, [createName, createDescription, createIcon, t, tActions, toast, resetCreateForm])

  const handleUpdate = useCallback(async (): Promise<void> => {
    if (!editingCategory || !editName.trim()) return

    setIsUpdating(true)

    try {
      const response = await updateCategory(editingCategory.id, {
        name: editName.trim() || undefined,
        slug: editSlug.trim() || undefined,
        description: editDescription.trim() || null,
        icon: editIcon.trim() || null,
        isActive: editIsActive
      })

      if (response.success && response.data) {
        setCategories((prev) => prev.map((cat) => (cat.id === editingCategory.id ? response.data! : cat)))
        toast.success(t('messages.updateSuccess'))
        setIsEditOpen(false)
        setEditingCategory(null)
      } else {
        toast.error(response.message)
      }
    } catch {
      toast.error(tActions('unknownError'))
    } finally {
      setIsUpdating(false)
    }
  }, [editingCategory, editName, editSlug, editDescription, editIcon, editIsActive, t, tActions, toast])

  const handleDeactivate = useCallback(
    async (id: string): Promise<void> => {
      setIsDeactivating(true)
      setDeactivatingId(id)

      try {
        const response = await deactivateCategory(id)

        if (response.success && response.data) {
          setCategories((prev) => prev.map((cat) => (cat.id === id ? response.data! : cat)))
          toast.success(t('messages.deactivateSuccess'))
        } else {
          toast.error(response.message)
        }
      } catch {
        toast.error(tActions('unknownError'))
      } finally {
        setIsDeactivating(false)
        setDeactivatingId(null)
      }
    },
    [t, tActions, toast]
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">{t('description')}</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>{t('create')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('create')}</DialogTitle>
              <DialogDescription>{t('description')}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category-name">{tForm('name')}</Label>
                <Input id="category-name" value={createName} onChange={(e) => setCreateName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category-description">{tForm('description')}</Label>
                <Textarea
                  id="category-description"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder={tForm('descriptionPlaceholder')}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category-icon">{tForm('icon')}</Label>
                <Input id="category-icon" value={createIcon} onChange={(e) => setCreateIcon(e.target.value)} placeholder={tForm('iconPlaceholder')} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                {tActions('cancel')}
              </Button>
              <Button onClick={handleCreate} disabled={!createName.trim() || isCreating}>
                {isCreating ? tActions('submitting') : tActions('submit')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tForm('name')}</TableHead>
              <TableHead className="hidden sm:table-cell">{tForm('slug')}</TableHead>
              <TableHead className="hidden md:table-cell">{tColumns('createdAt')}</TableHead>
              <TableHead>{tForm('isActive')}</TableHead>
              <TableHead className="text-right">{tColumns('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                  {t('empty.title')}
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground hidden text-sm sm:table-cell">{category.slug}</TableCell>
                  <TableCell className="text-muted-foreground hidden text-sm whitespace-nowrap md:table-cell">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Switch checked={category.isActive} disabled aria-label={category.isActive ? tForm('isActive') : 'Inactive'} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
                        {tActions('edit')}
                      </Button>
                      {category.isActive ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeactivate(category.id)}
                          disabled={isDeactivating && deactivatingId === category.id}
                        >
                          {isDeactivating && deactivatingId === category.id ? tActions('submitting') : t('deactivate')}
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('edit')}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">{tForm('name')}</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-slug">{tForm('slug')}</Label>
              <Input id="edit-slug" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} />
              <p className="text-muted-foreground text-xs">{tForm('slugHelper')}</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">{tForm('description')}</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder={tForm('descriptionPlaceholder')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-icon">{tForm('icon')}</Label>
              <Input id="edit-icon" value={editIcon} onChange={(e) => setEditIcon(e.target.value)} placeholder={tForm('iconPlaceholder')} />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="edit-is-active" checked={editIsActive} onCheckedChange={setEditIsActive} />
              <Label htmlFor="edit-is-active">{tForm('isActive')}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              {tActions('cancel')}
            </Button>
            <Button onClick={handleUpdate} disabled={!editName.trim() || isUpdating}>
              {isUpdating ? tActions('submitting') : tActions('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

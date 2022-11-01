import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "../../../api";
import { ClassificationCategory } from "../../../api/types";
import { Box, Button, Modal } from "../../../components"
import { UseModalReturn } from "../../../hooks/useModal"

export const CatsEditModal = ({ modalState }: { modalState: UseModalReturn }): JSX.Element => {
  const addNewForm = useForm<{ name: string, values: string }>({ defaultValues: { name: 'Category name', values: 'Tag1,Tag2,etc' } });
  const [addNew, setAddNew] = useState(false);
  const [defaultCategories, setDefaultCategories] = useState<ClassificationCategory[]>([]);

  useEffect(() => {
    api.categories.get()
      .then(setDefaultCategories)
      .catch(console.error);
  }, []);

  const handleChangeValues = (catId: number) => (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = ev.target.value.split(',');
    setDefaultCategories((prev) => prev.map((_) => _.id !== catId ? _ : ({ ..._, values: next })));
  }

  const handleChangeName = (catId: number) => (ev: React.ChangeEvent<HTMLInputElement>) => {
    const next = ev.target.value;
    setDefaultCategories((prev) => prev.map((_) => _.id !== catId ? _ : ({ ..._, name: next })));
  }

  const handleApply = async () => {
    for (let cat of defaultCategories) {
      await api.categories.update(cat);
    }

    alert('done');
  }

  const handleAddNew = () => {
    setAddNew(true);
  }

  const handleSubmit = ({ name, values }: { name: string, values: string }) => {
    api.categories.create({ name, values: values.split(',') })
      .then(() => {
        api.categories.get()
        .then((res) => {
          setDefaultCategories(res);
          addNewForm.reset();
          setAddNew(false);
        })
        .catch(console.error);
      });
  }

  return (
    <Modal state={modalState}>
      <Box width="100%" flexDirection="column" gap={14}>
        {defaultCategories.map(_ => (
          <Box key={_.id} width="100%" flexDirection="column" gap={4}>
            <input style={{ maxWidth: '320px' }} type="text" defaultValue={_.name} onChange={handleChangeName(_.id)} />
            <textarea style={{ minWidth: '100%', maxWidth: '100%' }} defaultValue={_.values.join(',')} rows={3} onChange={handleChangeValues(_.id)} />
          </Box>
        ))}

        {addNew ? (
          <form onSubmit={addNewForm.handleSubmit(handleSubmit)}>
            <Box gap={14}>
              <input {...addNewForm.register('name')} />
              <input {...addNewForm.register('values')} />

              <Button size="small" variant="primary" onClick={() => handleApply()} type="submit">Add</Button>
            </Box>
          </form>
        ) : (
          <Box gap={14}>
            <Button size="small" variant="primary" onClick={() => handleAddNew()}>Add new category</Button>
            {Boolean(defaultCategories.length) && <Button size="small" variant="primary" onClick={() => handleApply()}>Apply</Button>}
          </Box>
        )}
      </Box>
    </Modal>
  );
}

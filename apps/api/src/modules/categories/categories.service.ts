import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Category } from '@prisma/client';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

export interface CategoryNode extends Category {
  children: CategoryNode[];
  ticketCount: number;
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    if (dto.parentId) {
      await this.findById(dto.parentId);
    }
    return this.prisma.category.create({ data: dto });
  }

  /** Lista plana — útil para selects no frontend (com caminho completo). */
  async findAll(includeInactive = false): Promise<(Category & { path: string })[]> {
    const categories = await this.prisma.category.findMany({
      where: includeInactive ? {} : { active: true },
      orderBy: { name: 'asc' },
    });

    const byId = new Map(categories.map((c) => [c.id, c]));
    const buildPath = (cat: Category): string => {
      const parent = cat.parentId ? byId.get(cat.parentId) : undefined;
      return parent ? `${buildPath(parent)} > ${cat.name}` : cat.name;
    };

    return categories
      .map((c) => ({ ...c, path: buildPath(c) }))
      .sort((a, b) => a.path.localeCompare(b.path));
  }

  /** Árvore hierárquica — útil para a tela de administração. */
  async findTree(): Promise<CategoryNode[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { tickets: true } } },
    });

    const nodes = new Map<string, CategoryNode>(
      categories.map((c) => [
        c.id,
        { ...c, children: [], ticketCount: c._count.tickets },
      ]),
    );

    const roots: CategoryNode[] = [];
    for (const node of nodes.values()) {
      if (node.parentId && nodes.has(node.parentId)) {
        nodes.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  async findById(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    await this.findById(id);

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('Categoria não pode ser pai de si mesma');
      }
      // Impede ciclos: o novo pai não pode ser descendente desta categoria
      let cursor: string | null = dto.parentId;
      while (cursor) {
        if (cursor === id) {
          throw new BadRequestException(
            'Mover para uma subcategoria criaria um ciclo',
          );
        }
        const parent: { parentId: string | null } | null =
          await this.prisma.category.findUnique({
            where: { id: cursor },
            select: { parentId: true },
          });
        cursor = parent?.parentId ?? null;
      }
    }

    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async delete(id: string): Promise<{ message: string }> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { tickets: true, children: true } } },
    });
    if (!category) throw new NotFoundException('Categoria não encontrada');

    if (category._count.tickets > 0) {
      throw new BadRequestException(
        'Categoria possui tickets vinculados. Desative-a em vez de excluir.',
      );
    }
    if (category._count.children > 0) {
      throw new BadRequestException(
        'Categoria possui subcategorias. Exclua ou mova as subcategorias primeiro.',
      );
    }

    await this.prisma.category.delete({ where: { id } });
    return { message: 'Categoria excluída com sucesso' };
  }
}
